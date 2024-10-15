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
