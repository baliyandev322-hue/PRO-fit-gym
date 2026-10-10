const express = require('express');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

// Memory store fallback for workouts
let inMemoryPlans = [
  {
    id: 'plan-push-power',
    member_id: 'user-member-1',
    trainer_id: 'user-trainer-1',
    trainer_name: 'Marcus Drake',
    title: 'Push Day: Heavy Upper Body Force',
    category: 'Push',
    is_active: true,
    created_at: new Date().toISOString(),
    notes: 'Prioritize barbell control, full chest stretch, and explosive concentric drive.',
    exercises: [
      {
        id: 'ex-01',
        plan_id: 'plan-push-power',
        exercise_name: 'Barbell Bench Press',
        sets: 4,
        reps: 8,
        target_weight_kg: 90,
        rest_seconds: 120,
        order_index: 1,
        instructions: 'Touch sternum with 1-second pause. Drive through the heels.'
      },
      {
        id: 'ex-02',
        plan_id: 'plan-push-power',
        exercise_name: 'Incline Dumbbell Press',
        sets: 3,
        reps: 10,
        target_weight_kg: 32,
        rest_seconds: 90,
        order_index: 2,
        instructions: '30-degree bench angle. Maintain scapular retraction.'
      },
      {
        id: 'ex-03',
        plan_id: 'plan-push-power',
        exercise_name: 'Standing Overhead Press',
        sets: 3,
        reps: 10,
        target_weight_kg: 55,
        rest_seconds: 90,
        order_index: 3,
        instructions: 'Brace core tightly. Lock out overhead without hyperextending lumbar.'
      },
      {
        id: 'ex-04',
        plan_id: 'plan-push-power',
        exercise_name: 'Cable Tricep Pushdown',
        sets: 4,
        reps: 12,
        target_weight_kg: 35,
        rest_seconds: 60,
        order_index: 4,
        instructions: 'Pin elbows to sides. Full lockout and squeeze at bottom.'
      }
    ]
  },
  {
    id: 'plan-pull-posterior',
    member_id: 'user-member-1',
    trainer_id: 'user-trainer-1',
    trainer_name: 'Marcus Drake',
    title: 'Pull Day: Posterior Chain & Lats',
    category: 'Pull',
    is_active: false,
    created_at: new Date().toISOString(),
    notes: 'Heavy compound deadlifts followed by vertical and horizontal pulling.',
    exercises: [
      {
        id: 'ex-05',
        plan_id: 'plan-pull-posterior',
        exercise_name: 'Conventional Deadlift',
        sets: 4,
        reps: 6,
        target_weight_kg: 160,
        rest_seconds: 180,
        order_index: 1,
        instructions: 'Pull slack out of the bar before lift-off. Neutral cervical spine.'
      },
      {
        id: 'ex-06',
        plan_id: 'plan-pull-posterior',
        exercise_name: 'Weighted Pull-Ups',
        sets: 4,
        reps: 8,
        target_weight_kg: 15,
        rest_seconds: 90,
        order_index: 2,
        instructions: 'Full dead-hang to chin cleanly over the bar.'
      }
    ]
  }
];

let inMemoryLogs = [
  {
    id: 'log-001',
    member_id: 'user-member-1',
    exercise_name: 'Barbell Bench Press',
    actual_sets: 4,
    actual_reps: 8,
    actual_weight_kg: 90,
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Hit all reps with solid pause on chest.'
  }
];

/**
 * @route   GET /api/workouts/plans
 * @desc    Get all workout plans
 * @access  Public / Authenticated
 */
router.get('/plans', (req, res) => {
  return res.status(200).json({
    success: true,
    data: inMemoryPlans
  });
});

/**
 * @route   GET /api/workouts/plans/:memberId
 * @desc    Get assigned workout plans for an athlete
 * @access  Public / Authenticated
 */
router.get('/plans/:memberId', (req, res) => {
  const { memberId } = req.params;
  const plans = inMemoryPlans.filter(p => p.member_id === memberId);

  return res.status(200).json({
    success: true,
    data: plans.length > 0 ? plans : inMemoryPlans
  });
});

/**
 * @route   POST /api/workouts/plans
 * @desc    Create and assign a workout plan
 * @access  Private (Trainer/Admin)
 */
router.post('/plans', (req, res) => {
  try {
    const { title, category, member_id, trainer_id, trainer_name, exercises, notes } = req.body;

    if (!title || !exercises || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Plan title and at least one exercise are required.'
      });
    }

    const newPlanId = `plan_${Date.now()}`;
    const formattedExercises = exercises.map((ex, index) => ({
      id: `ex_${Date.now()}_${index}`,
      plan_id: newPlanId,
      exercise_name: ex.exercise_name || 'Exercise',
      sets: Number(ex.sets) || 3,
      reps: Number(ex.reps) || 10,
      target_weight_kg: Number(ex.target_weight_kg) || 0,
      rest_seconds: Number(ex.rest_seconds) || 60,
      order_index: index + 1,
      instructions: ex.instructions || ''
    }));

    const newPlan = {
      id: newPlanId,
      member_id: member_id || 'user-member-1',
      trainer_id: trainer_id || 'user-trainer-1',
      trainer_name: trainer_name || 'Marcus Drake',
      title,
      category: category || 'Push',
      is_active: true,
      created_at: new Date().toISOString(),
      notes: notes || '',
      exercises: formattedExercises
    };

    inMemoryPlans.unshift(newPlan);

    return res.status(201).json({
      success: true,
      message: `Workout plan "${title}" successfully assigned!`,
      plan: newPlan
    });
  } catch (error) {
    console.error('[Create Workout Plan Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create workout plan.'
    });
  }
});

/**
 * @route   POST /api/workouts/log
 * @desc    Log completed exercise sets and weights
 * @access  Public / Authenticated
 */
router.post('/log', (req, res) => {
  try {
    const { member_id, exercise_name, actual_sets, actual_reps, actual_weight_kg, notes } = req.body;

    if (!member_id || !exercise_name) {
      return res.status(400).json({
        success: false,
        message: 'Member ID and Exercise name are required.'
      });
    }

    const newLog = {
      id: `log_${Date.now()}`,
      member_id,
      exercise_name,
      actual_sets: Number(actual_sets) || 1,
      actual_reps: Number(actual_reps) || 1,
      actual_weight_kg: Number(actual_weight_kg) || 0,
      completed_at: new Date().toISOString(),
      notes: notes || ''
    };

    inMemoryLogs.unshift(newLog);

    return res.status(201).json({
      success: true,
      message: 'Workout set successfully recorded.',
      log: newLog
    });
  } catch (error) {
    console.error('[Workout Log Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log workout set.'
    });
  }
});

/**
 * @route   GET /api/workouts/logs/:memberId
 * @desc    Get athlete workout logs
 * @access  Public / Authenticated
 */
router.get('/logs/:memberId', (req, res) => {
  const { memberId } = req.params;
  const logs = inMemoryLogs.filter(l => l.member_id === memberId);

  return res.status(200).json({
    success: true,
    data: logs
  });
});

module.exports = router;
