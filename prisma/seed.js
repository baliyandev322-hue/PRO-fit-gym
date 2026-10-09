const { PrismaClient, UserRole, MembershipStatus, WorkoutCategory } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PROFIT Training Club Database Seeding...');

  // 1. Clear existing seed records if needed (safe upserts used)
  const defaultPassword = 'password123';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  // 2. Seed Membership Plans
  const plans = [
    {
      slug: 'starter',
      name: 'Starter',
      priceInr: 14900,
      durationDays: 30,
      description: 'Foundational strength access for dedicated athletes starting their journey.',
      features: [
        'Full gym floor access',
        'Locker room & rainfall sauna',
        'Initial biomechanics movement assessment',
        'PROFIT mobile app workout tracker',
        'Standard periodized templates'
      ],
      isPopular: false
    },
    {
      slug: 'performance',
      name: 'Performance',
      priceInr: 24900,
      durationDays: 30,
      description: 'The complete high-performance standard. Designed for serious progression.',
      features: [
        'All Starter benefits',
        'Unlimited 24/7 keycard & encrypted QR access',
        'Bi-weekly 1-on-1 coach check-ins',
        'Custom periodized programming',
        'Recovery suite (Cold plunge + Infrared sauna)',
        'InBody monthly body composition scan'
      ],
      isPopular: true
    },
    {
      slug: 'elite',
      name: 'Elite',
      priceInr: 39900,
      durationDays: 30,
      description: 'The pinnacle of bespoke physical preparation with unrestricted VIP access.',
      features: [
        'All Performance benefits',
        'Dedicated Senior Master Coach',
        'Weekly 1-on-1 private lifting sessions',
        'Personal nutrition & macros blueprint',
        'Permanent private executive locker',
        'Complimentary guest pass monthly',
        'Quarterly bloodwork & VO2 Max consult'
      ],
      isPopular: false
    }
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan
    });
  }
  console.log('✅ Seeded 3 Membership Plans (Starter, Performance, Elite)');

  // 3. Seed 1 Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@profitgym.com' },
    update: { role: UserRole.ADMIN, fullName: 'Dev Baliyan' },
    create: {
      email: 'admin@profitgym.com',
      passwordHash,
      role: UserRole.ADMIN,
      fullName: 'Dev Baliyan',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      adminProfile: {
        create: {
          department: 'Executive Operations',
          permissions: ['ALL', 'MANAGE_MEMBERS', 'MANAGE_PLANS', 'MANAGE_REVENUE', 'GATE_TERMINAL']
        }
      }
    }
  });
  console.log(`✅ Seeded 1 Admin: ${adminUser.email}`);

  // 4. Seed 2 Trainers / Master Coaches
  const trainersData = [
    {
      email: 'trainer@profitgym.com',
      fullName: 'Marcus Drake',
      specialty: 'Head Strength Specialist',
      certifications: ['CSCS', 'USAW Level 2', 'EXOS Performance']
    },
    {
      email: 'chloe@profitgym.com',
      fullName: 'Chloe Sterling',
      specialty: 'Director of Biomechanics',
      certifications: ['Doctor of Physical Therapy (DPT)', 'EXOS', 'FMS Level 2']
    }
  ];

  const createdTrainers = [];
  for (const t of trainersData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: { role: UserRole.TRAINER, fullName: t.fullName },
      create: {
        email: t.email,
        passwordHash,
        role: UserRole.TRAINER,
        fullName: t.fullName,
        phone: '+91 98111 22334',
        avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
        trainerProfile: {
          create: {
            specialty: t.specialty,
            certifications: t.certifications,
            isAvailable: true
          }
        }
      },
      include: { trainerProfile: true }
    });
    createdTrainers.push(user);
  }
  console.log(`✅ Seeded 2 Master Coaches (Marcus Drake, Chloe Sterling)`);

  // 5. Seed 5 Sample Athlete Members
  const performancePlan = await prisma.membershipPlan.findUnique({ where: { slug: 'performance' } });
  const starterPlan = await prisma.membershipPlan.findUnique({ where: { slug: 'starter' } });
  const elitePlan = await prisma.membershipPlan.findUnique({ where: { slug: 'elite' } });

  const membersData = [
    {
      email: 'member@profitgym.com',
      fullName: 'Alex Vance',
      planId: performancePlan.id,
      daysLeft: 18,
      status: MembershipStatus.ACTIVE
    },
    {
      email: 'elena.rostova@athlete.com',
      fullName: 'Elena Rostova',
      planId: elitePlan.id,
      daysLeft: 25,
      status: MembershipStatus.ACTIVE
    },
    {
      email: 'jordan.bell@business.com',
      fullName: 'Jordan Bell',
      planId: starterPlan.id,
      daysLeft: 2,
      status: MembershipStatus.EXPIRING_SOON
    },
    {
      email: 'david.zhao@nyu.edu',
      fullName: 'David Zhao',
      planId: performancePlan.id,
      daysLeft: 0,
      status: MembershipStatus.EXPIRED
    },
    {
      email: 'sophia.laurent@design.com',
      fullName: 'Sophia Laurent',
      planId: elitePlan.id,
      daysLeft: 22,
      status: MembershipStatus.ACTIVE
    }
  ];

  for (const m of membersData) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: { fullName: m.fullName },
      create: {
        email: m.email,
        passwordHash,
        role: UserRole.MEMBER,
        fullName: m.fullName,
        memberProfile: {
          create: {
            emergencyContact: 'Emergency Contact - +91 99887 76655',
            qrPassToken: `QR_${m.email.split('@')[0].toUpperCase()}_TOKEN`
          }
        }
      },
      include: { memberProfile: true }
    });

    if (user.memberProfile) {
      // Create membership record
      const expiry = new Date(Date.now() + m.daysLeft * 86400000);
      await prisma.membership.create({
        data: {
          memberId: user.memberProfile.id,
          planId: m.planId,
          status: m.status,
          expiryDate: expiry
        }
      });
    }
  }
  console.log(`✅ Seeded 5 Athletes with Active/Expiring/Expired Memberships`);

  // 6. Seed Exercises
  const exercises = [
    { name: 'Barbell Bench Press', category: WorkoutCategory.PUSH, targetMuscles: ['Chest', 'Anterior Delts', 'Triceps'] },
    { name: 'Conventional Deadlift', category: WorkoutCategory.PULL, targetMuscles: ['Glutes', 'Hamstrings', 'Erectors', 'Lats'] },
    { name: 'Back Squat', category: WorkoutCategory.LEGS, targetMuscles: ['Quads', 'Glutes', 'Adductors'] },
    { name: 'Overhead Barbell Press', category: WorkoutCategory.PUSH, targetMuscles: ['Shoulders', 'Upper Chest', 'Triceps'] },
    { name: 'Weighted Pull-Ups', category: WorkoutCategory.PULL, targetMuscles: ['Lats', 'Rhomboids', 'Biceps'] }
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: ex,
      create: ex
    });
  }
  console.log('✅ Seeded 5 Standardized Calibrated Movements');

  console.log('\n🎉 Seeding Completed Successfully! All accounts set with password: "password123"\n');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
