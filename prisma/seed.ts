import prisma from '../lib/prisma';

async function main() {
  // Create default UPI payment info if it doesn't exist
  const existingPaymentInfo = await prisma.paymentInfo.findFirst({
    where: { type: 'UPI' }
  });

  if (!existingPaymentInfo) {
    await prisma.paymentInfo.create({
      data: {
        type: 'UPI',
        upiId: 'developer.aditya09@oksbi',
        merchantName: 'Astex',
        isActive: true,
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 