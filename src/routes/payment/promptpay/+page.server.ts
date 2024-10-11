import type { Actions, PageServerLoad } from './$types';
import { processPayment } from '$lib/database/paymentService.server';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  return {
    reservedSeatId: params.reservedSeatId ?? 'default-seat-id'
  };
};

export const actions: Actions = {
  simulatePayment: async ({ request }) => {
    const formData = await request.formData();
    const paymentId = Number(formData.get('payment_id'));
    const paymentMethod = formData.get('payment_method') as string;

    try {
      // Process the payment
      await processPayment(paymentId, paymentMethod);
      
      // If payment is successful, return a success status and the redirect URL
      return { success: true, redirectUrl: '../../list_ticket' };
    } catch (error) {
      // Log the actual error
      console.error('Payment simulation error:', error);
      
      // Return a fail response
      return fail(500, { message: 'Failed to simulate payment' });
    }
  }
};