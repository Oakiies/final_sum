<script lang="ts">
  import { toast } from 'svelte-sonner';
 import { superForm } from 'sveltekit-superforms/client';
 import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';
 import InputField from '$components/form/InputField.svelte';
 import SubmitButton from '$components/form/SubmitButton.svelte';
 import type { PageData } from './$types';
 import { goto } from '$app/navigation';
 import Swal from 'sweetalert2';
 export let data: PageData;
 function redirectToRegister() {
 goto('register');
  }
 const { enhance, form, errors, message } = superForm(data.userLoginFormData, {
 resetForm: true,
 taintedMessage: null,
 validators: UserLoginZodSchema,
 onUpdated: ({ form }) => {
 if (form.valid) {
 Swal.fire({
 title: 'เข้าสู่ระบบสำเร็จ!',
 text: 'กำลังนำคุณไปยังหน้าหลัก',
 icon: 'success',
 timer: 2000,
 showConfirmButton: false
  }).then(() => {
 goto('/'); // หรือเปลี่ยนเป็นเส้นทางหน้าหลักของคุณ
  });
  } else if ($message) {
 const { alertType, alertText } = $message;
 if (alertType === 'error') {
 toast.error(alertText);
  }
  }
  }
  });
 </script>
 <svelte:head>
 <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.19/dist/sweetalert2.min.css">
 </svelte:head>
 <div class="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
 <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl transform transition-all hover:scale-105">
 <div>
 <h2 class="mt-6 text-center text-4xl font-extrabold text-gray-900 mb-2">
  เข้าสู่ระบบ
 </h2>
 <p class="text-center text-sm text-gray-600 mb-8">
  ยินดีต้อนรับกลับมา
 </p>
 </div>
 <form method="post" use:enhance class="mt-8 space-y-6">
 <InputField
 type="text"
 name="email"
 label="อีเมล / ชื่อผู้ใช้งาน"
 bind:value={$form.email}
 errorMessage={$errors.email}
 class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
 />
 <InputField
 type="password"
 name="password"
 label="รหัสผ่าน"
 bind:value={$form.password}
 errorMessage={$errors.password}
 class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
 />
 <div>
 <SubmitButton
 class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
 >
  เข้าสู่ระบบ
 </SubmitButton>
 </div>
 </form>
 <div class="text-center mt-4">
 <p class="text-sm text-gray-600">
  ยังไม่มีบัญชี?
 href="#"
 on:click|preventDefault={redirectToRegister}
 class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
 >
  สมัครสมาชิก
 </a>
 </p>
 </div>
 </div>
 </div>