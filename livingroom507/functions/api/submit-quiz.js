import { error, json, requireDb } from '../_lib/http.js';

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost({ request, env }) {
  try {
    requireDb(env);

    const body = await request.json();
    const userEmail = typeof body.user_email === 'string'
      ? body.user_email.trim().toLowerCase()
      : typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';
    const fullName = typeof body.fullName === 'string'
      ? body.fullName.trim()
      : typeof body.full_name === 'string'
        ? body.full_name.trim()
        : '';
    const moduleNumber = Number(body.module_number);
    const score = Number(body.score);
    const totalQuestions = Number(body.total_questions);
    const percentage = body.percentage == null
      ? (totalQuestions > 0 ? (score / totalQuestions) * 100 : 0)
      : Number(body.percentage);

    if (!isValidEmail(userEmail)) {
      return error('A valid quiz email is required.');
    }

    if (!Number.isInteger(moduleNumber) || moduleNumber < 1) {
      return error('module_number must be a positive integer.');
    }

    if (!Number.isFinite(score) || score < 0) {
      return error('score must be a non-negative number.');
    }

    if (!Number.isFinite(totalQuestions) || totalQuestions <= 0) {
      return error('total_questions must be greater than zero.');
    }

    if (score > totalQuestions) {
      return error('score cannot be greater than total_questions.');
    }

    await env.DB.prepare(
      `INSERT INTO quiz_results (full_name, user_email, module_number, score, total_questions, percentage)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      fullName || null,
      userEmail,
      moduleNumber,
      score,
      totalQuestions,
      Number(percentage.toFixed(2))
    ).run();

    return json({
      success: true,
      userEmail,
      moduleNumber,
      score,
      totalQuestions,
      percentage: Number(percentage.toFixed(2)),
    }, { status: 201 });
  } catch (caughtError) {
    return error('Failed to submit quiz results.', 500, caughtError.message);
  }
}
