const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
    trim: true,
  },
  sets: {
    type: Number,
    default: 3,
  },
  reps: {
    type: Number,
    default: 10,
  },
  targetWeightKg: {
    type: Number,
    default: 0,
  },
  restSeconds: {
    type: Number,
    default: 90,
  },
  orderIndex: {
    type: Number,
    default: 1,
  },
  instructions: {
    type: String,
    trim: true,
  },
});

const workoutPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.Mixed,
      index: true,
    },
    trainerName: {
      type: String,
      default: 'Marcus Drake',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Push',
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    exercises: [exerciseSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
