function fallbackNameFromEmail(email) {
  return email.split('@')[0] || 'Affiliate User';
}

async function getTableColumns(env, tableName) {
  const { results } = await env.DB.prepare(`PRAGMA table_info(${tableName})`).all();
  return new Set((results || []).map((column) => column.name));
}

async function getSchema(env) {
  const [users, subscriptions, plans] = await Promise.all([
    getTableColumns(env, 'users'),
    getTableColumns(env, 'subscriptions'),
    getTableColumns(env, 'plans'),
  ]);

  return { users, subscriptions, plans };
}

function getNameColumn(userColumns) {
  if (userColumns.has('name')) {
    return 'name';
  }

  if (userColumns.has('full_name')) {
    return 'full_name';
  }

  return null;
}

function getSubscriptionOrderColumn(subscriptionColumns) {
  if (subscriptionColumns.has('updated_at')) {
    return 'updated_at';
  }

  if (subscriptionColumns.has('start_date')) {
    return 'start_date';
  }

  if (subscriptionColumns.has('created_at')) {
    return 'created_at';
  }

  return 'id';
}

function getUserSelectColumns(userColumns) {
  const nameColumn = getNameColumn(userColumns);

  return {
    nameSelect: nameColumn ? `u.${nameColumn} AS fullName` : `u.email AS fullName`,
    paypalSelect: userColumns.has('paypal_email')
      ? `COALESCE(u.paypal_email, u.email) AS paypalEmail`
      : `u.email AS paypalEmail`,
    publicBioSelect: userColumns.has('public_bio')
      ? `COALESCE(u.public_bio, '') AS publicBio`
      : `'' AS publicBio`,
    profilePictureSelect: userColumns.has('profile_picture_url')
      ? `COALESCE(u.profile_picture_url, '') AS profilePictureUrl`
      : `'' AS profilePictureUrl`,
  };
}

function getSubscriptionJoin(schema) {
  const { subscriptions, plans } = schema;

  if (!subscriptions.has('id') || !subscriptions.has('user_id')) {
    return {
      joins: '',
      planNameSelect: `'' AS currentPlanName`,
      purchaseUnitSelect: `0 AS purchaseUnit`,
      purchaseEarningSelect: `0 AS purchaseEarning`,
    };
  }

  const orderColumn = getSubscriptionOrderColumn(subscriptions);
  const activeFilter = subscriptions.has('status') ? `AND status = 'active'` : '';
  const planJoin = subscriptions.has('plan_name') && plans.has('plan_name')
    ? `LEFT JOIN plans p ON p.plan_name = s.plan_name`
    : '';

  const purchaseUnitSelect = subscriptions.has('purchase_unit')
    ? `COALESCE(s.purchase_unit, 0) AS purchaseUnit`
    : plans.has('purchase_unit')
      ? `COALESCE(p.purchase_unit, 0) AS purchaseUnit`
      : `0 AS purchaseUnit`;

  const purchaseEarningSelect = subscriptions.has('purchase_earning')
    ? `COALESCE(s.purchase_earning, 0) AS purchaseEarning`
    : plans.has('purchase_earning')
      ? `COALESCE(p.purchase_earning, 0) AS purchaseEarning`
      : `0 AS purchaseEarning`;

  return {
    joins: `
      LEFT JOIN subscriptions s
        ON s.id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = u.id ${activeFilter}
          ORDER BY ${orderColumn} DESC, id DESC
          LIMIT 1
        )
      ${planJoin}
    `,
    planNameSelect: subscriptions.has('plan_name')
      ? `COALESCE(s.plan_name, '') AS currentPlanName`
      : plans.has('plan_name')
        ? `COALESCE(p.plan_name, '') AS currentPlanName`
        : `'' AS currentPlanName`,
    purchaseUnitSelect,
    purchaseEarningSelect,
  };
}

export async function findUserByEmail(env, email) {
  const schema = await getSchema(env);
  const { nameSelect, paypalSelect, publicBioSelect, profilePictureSelect } = getUserSelectColumns(schema.users);
  const roleSelect = schema.users.has('role') ? `u.role AS role` : `'' AS role`;

  return env.DB.prepare(
    `SELECT
        u.id,
        ${nameSelect},
        u.email,
        ${roleSelect},
        ${paypalSelect},
        ${publicBioSelect},
        ${profilePictureSelect}
     FROM users u
     WHERE u.email = ?`
  ).bind(email).first();
}

export async function ensureAffiliateUser(env, { email, fullName }) {
  const existingUser = await findUserByEmail(env, email);
  if (existingUser) {
    return existingUser;
  }

  const schema = await getSchema(env);
  const displayName = fullName?.trim() || fallbackNameFromEmail(email);
  const insertColumns = [];
  const insertValues = [];

  const nameColumn = getNameColumn(schema.users);
  if (nameColumn) {
    insertColumns.push(nameColumn);
    insertValues.push(displayName);
  }

  insertColumns.push('email');
  insertValues.push(email);

  if (schema.users.has('role')) {
    insertColumns.push('role');
    insertValues.push('affiliate');
  }

  const placeholders = insertColumns.map(() => '?').join(', ');
  await env.DB.prepare(
    `INSERT INTO users (${insertColumns.join(', ')})
     VALUES (${placeholders})`
  ).bind(...insertValues).run();

  return findUserByEmail(env, email);
}

export async function ensureAffiliateMetrics(env, affiliateId) {
  await env.DB.prepare(
    `INSERT INTO affiliate_metrics (affiliate_id, customers_referred, total_earnings)
     VALUES (?, 0, 0)
     ON CONFLICT(affiliate_id) DO NOTHING`
  ).bind(affiliateId).run();
}

export async function loadAffiliateProfile(env, email) {
  const schema = await getSchema(env);
  const { nameSelect, paypalSelect, publicBioSelect, profilePictureSelect } = getUserSelectColumns(schema.users);
  const {
    joins,
    planNameSelect,
    purchaseUnitSelect,
    purchaseEarningSelect,
  } = getSubscriptionJoin(schema);

  return env.DB.prepare(
    `SELECT
        ${nameSelect},
        u.email,
        ${paypalSelect},
        ${publicBioSelect},
        ${profilePictureSelect},
        ${planNameSelect},
        ${purchaseUnitSelect},
        ${purchaseEarningSelect}
     FROM users u
     ${joins}
     WHERE u.email = ?`
  ).bind(email).first();
}

export async function updateAffiliateProfile(env, {
  email,
  fullName,
  paypalEmail,
  publicBio,
  password,
}) {
  const schema = await getSchema(env);
  const setClauses = [];
  const values = [];

  const nameColumn = getNameColumn(schema.users);
  if (nameColumn) {
    setClauses.push(`${nameColumn} = ?`);
    values.push(fullName || fallbackNameFromEmail(email));
  }

  if (schema.users.has('paypal_email')) {
    setClauses.push(`paypal_email = ?`);
    values.push(paypalEmail || email);
  }

  if (schema.users.has('public_bio')) {
    setClauses.push(`public_bio = ?`);
    values.push(publicBio || '');
  }

  if (password && schema.users.has('password_hash') && schema.users.has('password_salt')) {
    setClauses.push(`password_hash = ?`);
    setClauses.push(`password_salt = ?`);
    values.push(password.hash, password.salt);
  }

  if (schema.users.has('updated_at')) {
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  }

  if (setClauses.length > 0) {
    values.push(email);
    await env.DB.prepare(
      `UPDATE users
       SET ${setClauses.join(', ')}
       WHERE email = ?`
    ).bind(...values).run();
  }

  return loadAffiliateProfile(env, email);
}
