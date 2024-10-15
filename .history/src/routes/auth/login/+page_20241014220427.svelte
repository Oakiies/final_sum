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
</script>
<body class="bg-gray-100">
    <div class="mx-auto max-w-md px-4 py-8">
        <div class="bg-white shadow-md rounded-lg p-6 space-y-6">
            <div class="flex justify-center items-center">
                <h1 class="font-bold text-2xl sm:text-3xl md:text-4xl text-[#102C57] underline">เข้าสู่ระบบ</h1>
            </div>
            <form method="post" class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">อีเมล / ชื่อผู้ใช้งาน</label>
                    <input type="email" id="email" name="email" required
                        class="border-2 border-[#9F9F9F] rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#102C57] focus:border-transparent"
                    />
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                    <input type="password" id="password" name="password" required
                        class="border-2 border-[#9F9F9F] rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#102C57] focus:border-transparent"
                    />
                </div>
                <button type="submit"
                    class="w-full bg-[#102C57] text-white rounded-lg py-3 px-4 hover:bg-[#1c3f75] transition duration-300"
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
</body>