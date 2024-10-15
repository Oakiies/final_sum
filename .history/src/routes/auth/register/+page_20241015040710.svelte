<script lang="ts">
  import type { PageData } from './$types';
  import { toast } from 'svelte-sonner';
  import { superForm } from 'sveltekit-superforms/client';
  import { route } from '$lib/ROUTES';
  import { MAX_NAME_LENGTH, RegisterUserZodSchema } from '$validations/RegisterUserZodSchema';
  import InputField from '$components/form/InputField.svelte';
  import SubmitButton from '$components/form/SubmitButton.svelte';
  import Swal from 'sweetalert2';
  import { goto } from '$app/navigation';

  export let data: PageData;

  const { enhance, errors, form, message } = superForm(data.registerUserFormData, {
    resetForm: true,
    taintedMessage: null,
    validators: RegisterUserZodSchema,
    onUpdated: ({ form }) => {
      if (form.valid) {
        Swal.fire({
          title: 'ลงทะเบียนสำเร็จ!',
          text: 'กำลังนำคุณไปยังหน้าเข้าสู่ระบบ',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          goto(route('login')); // ใส่เส้นทางไปยังหน้าล็อกอินของคุณที่นี่
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

<div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        ลงทะเบียนเข้าสู่ระบบ
      </h2>
    </div>
    <form method="post" use:enhance class="mt-8 space-y-6" action={route('registerUser /auth/register')}>
      <div class="rounded-md shadow-sm -space-y-px">
        <InputField
          type="text"
          name="email"
          label="อีเมล / ชื่อผู้ใช้งาน"
          bind:value={$form.email}
          errorMessage={$errors.email}
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        />
        <InputField
          type="password"
          name="password"
          label="รหัสผ่าน"
          bind:value={$form.password}
          errorMessage={$errors.password}
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        />
        <InputField
          type="password"
          name="confirmPassword"
          label="ยืนยันรหัสผ่าน"
          bind:value={$form.confirmPassword}
          errorMessage={$errors.confirmPassword}
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        />
      </div>

      <div class="pt-8 border-t border-gray-200">
        <p class="text-md font-medium text-gray-700 mb-4">ข้อมูลส่วนตัว</p>
        <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <InputField
            type="text"
            name="firstname"
            placeholder="ชื่อจริง"
            bind:value={$form.firstname}
            errorMessage={$errors.firstname}
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <InputField
            type="text"
            name="lastname"
            placeholder="นามสกุล"
            bind:value={$form.lastname}
            errorMessage={$errors.lastname}
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <InputField
            type="tel"
            name="phonenumber"
            placeholder="เบอร์โทรศัพท์"
            bind:value={$form.phonenumber}
            errorMessage={$errors.phonenumber}
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <InputField
            type="text"
            name="personal_id"
            placeholder="เลขบัตรประจำตัวประชาชน"
            bind:value={$form.personal_id}
            errorMessage={$errors.personal_id}
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <SubmitButton class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          ยืนยันการสมัคร
        </SubmitButton>
      </div>
    </form>
  </div>
</div>