<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  export let data;
  let reservedSeatId = data.reservedSeatId;

  let email = '';
  let firstName = '';
  let lastName = '';
  let cardNumber = '';
  let expiryDate = '';
  let cvc = '';
  let selectedPaymentMethod = ''; // เริ่มต้นด้วยค่าว่างเปล่า
  let countdown = 300;
  let countdownInterval: NodeJS.Timeout;

  $: if (selectedPaymentMethod === 'PromptPay' && !countdownInterval) {
    startCountdown();
  }

  function startCountdown() {
    countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        // Handle timeout (e.g., show message, disable payment)
      }
    }, 1000);
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function handlePayment(event) {
    return async ({ result }) => {
      if (result.type === 'success' && result.data.redirectUrl) {
        await goto(result.data.redirectUrl);
      }
    };
  }
</script>

<div class="flex flex-col md:flex-row md:justify-between items-center p-8 mb-2">
  <!-- Payment Form Section -->
  <div class="w-full md:w-1/2">
    <form method="POST" action="?/simulatePayment" use:enhance={handlePayment}>
      <input type="hidden" name="reserved_seat_id" value={reservedSeatId} />
      <input type="hidden" name="payment_id" value="10014" />
      
      <div class="mb-2">
        <label for="payment-method" class="block mb-2 text-[#102C57] font-extrabold text-xl">เลือกวิธีการชำระเงิน</label>
        <div class="border border-[#9F9F9F] rounded-lg p-2 flex justify-between">
          <select id="payment-method" name="payment_method" class="w-full focus:outline-none text-[#9F9F9F]" bind:value={selectedPaymentMethod}>
            <option value="">-- กรุณาเลือกวิธีการชำระเงิน --</option>
            <option value="PromptPay">QR พร้อมเพย์</option>
            <option value="MasterCard">บัตรเครดิต/เดบิต</option>
          </select>
        </div>
      </div>
      {#if selectedPaymentMethod}
        <div class="border-t border-black my-4"></div>

        {#if selectedPaymentMethod === 'PromptPay'}
          <!-- PromptPay section -->
          <div class="mb-4">
            <p class="block mb-2 text-[#102C57] font-extrabold text-xl">ช่องทางชำระเงินด้วย PromtPay</p>
            <div class="flex flex-col justify-normal items-center">
              <img src="https://www.theodoostore.com/web/image/app/10392/app_icon" alt="PromptPay QR" />    
            </div>
            <div class="flex flex-col justify-normal items-center">
              <p class="text-3xl font-bold text-[#590606]">ชำระภายใน: {formatTime(countdown)}</p>
            </div>
          </div>
        {:else if selectedPaymentMethod === 'MasterCard'}
          <!-- Credit/Debit section -->
          <div class="mb-4">
            <p class="block mb-2 text-[#102C57] font-extrabold text-xl">ข้อมูลส่วนบุคคล</p>
            <div class="border-2 border-dashed border-[#9747FF] rounded-lg p-4">
              <!-- Email -->
              <div class="mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="อีเมล"
                  class="w-full p-2 border border-[#9F9F9F] rounded-lg focus:outline-none"
                  bind:value={email}
                  required
                />
              </div>

              <!-- Name -->
              <div class="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="ชื่อจริง"
                  class="p-2 border border-[#9F9F9F] rounded-lg focus:outline-none"
                  bind:value={firstName}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="นามสกุล"
                  class="p-2 border border-[#9F9F9F] rounded-lg focus:outline-none"
                  bind:value={lastName}
                  required
                />
              </div>

              <!-- Card Number -->
              <div class="mb-3">
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="หมายเลขบัตร"
                  class="w-full p-2 border border-[#9F9F9F] rounded-lg focus:outline-none"
                  bind:value={cardNumber}
                  required
                />
              </div>

              <!-- Expiry Date and CVC -->
              <div class="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="วันหมดอายุ"
                  class="p-2 border border-[#9F9F9F] rounded-lg focus:outline-none"
                  bind:value={expiryDate}
                  required
                />
                <input
                  type="text"
                  name="cvc"
                  placeholder="CVC / หมายเลขหลังบัตร"
                  class="p-2 border border-[#9F9F9F] rounded-lg focus:outline-none"
                  bind:value={cvc}
                  required
                />
              </div>
            </div>
          </div>
        {/if}

        <!-- Payment Button -->
        <div class="text-right">
          <button type="submit" class="bg-[#102C57] text-white py-2 px-4 rounded-lg">
            ชำระเงิน
          </button>
        </div>
      {/if}
    </form>
  </div>

  <!-- Image and Text Section -->
  <div class="w-full md:w-1/2 mt-8 md:mt-0 flex flex-col items-center">
    <div class="flex flex-col justify-center items-center mx-8 space-y-8">
      <h2 class="text-[#102C57] text-3xl font-black mb-4 underline">คุณเตรียมตัวเดินทาง เราจะพาคุณไปถึงจุดหมาย</h2>
      <img
        src="https://cdn-icons-png.flaticon.com/512/235/235861.png"
        alt="Map Icon"
        class="w-40 h-40"
      />
    </div>
  </div>
</div>