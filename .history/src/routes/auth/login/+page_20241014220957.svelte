<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';

	import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';
	import InputField from '$components/form/InputField.svelte';
	import SubmitButton from '$components/form/SubmitButton.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	const { enhance, form, errors, message } = superForm(data.userLoginFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: UserLoginZodSchema,

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});
    import Swal from 'sweetalert2';
    import { goto } from '$app/navigation';
    
    let form = {
      email: '',
      password: ''
    };
    
    let errors = {
      email: '',
      password: ''
    };
    
    function handleSubmit(event) {
      // Prevent the default form submission
      event.preventDefault();
    
      // Basic form validation
      errors.email = form.email ? '' : 'กรุณากรอกอีเมล';
      errors.password = form.password ? '' : 'กรุณากรอกรหัสผ่าน';
    
      if (!errors.email && !errors.password) {
        // If validation passes, show success message
        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: 'ยินดีต้อนรับกลับมา',
          icon: 'success',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#102C57'
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to dashboard or home page
            goto('/dashboard');
          }
        });
      } else {
        // If validation fails, show error message
        Swal.fire({
          title: 'ข้อผิดพลาด!',
          text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#102C57'
        });
      }
    }
    </script>
    
    <div class="mx-auto max-w-md px-4 py-8">
      <div class="bg-white shadow-lg rounded-lg p-8 space-y-8">
        <div class="flex justify-center items-center">
          <h1 class="font-bold text-3xl text-[#102C57] underline">เข้าสู่ระบบ</h1>
        </div>
        <form on:submit={handleSubmit} class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">อีเมล / ชื่อผู้ใช้งาน</label>
            <input
              type="email"
              id="email"
              bind:value={form.email}
              class="border-2 border-[#9F9F9F] rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#102C57] focus:border-transparent transition duration-300"
            />
            {#if errors.email}
              <p class="text-red-500 text-xs mt-1">{errors.email}</p>
            {/if}
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              bind:value={form.password}
              class="border-2 border-[#9F9F9F] rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#102C57] focus:border-transparent transition duration-300"
            />
            {#if errors.password}
              <p class="text-red-500 text-xs mt-1">{errors.password}</p>
            {/if}
          </div>
          <button
            type="submit"
            class="w-full bg-[#102C57] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#1c3f75] transition duration-300"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <div class="text-center">
          <p class="text-sm text-gray-600">
            ยังไม่มีบัญชี? 
            <a href="/register" class="text-[#102C57] hover:underline font-medium">สมัครสมาชิก</a>
          </p>
        </div>
      </div>
    </div>