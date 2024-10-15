<script>
	import { formatDateTime, formatSeatType } from '$lib/utils.js';
	/** @type {import('./$types').PageData} */
	export let data;
	let isLoading = true;
	let reservations = [];
  
	$: if (data?.reservations) {
	  reservations = data.reservations;
	  isLoading = false;
	}
  
	$: upcomingTravels = reservations.filter((reservation) => reservation.reserve_status === 'ready');
	$: pastTravels = reservations.filter((reservation) => reservation.reserve_status === 'used');
  
	const ChangeTicketForm = ({ trip }) => `
	<form action="search_change" method="get" class="flex space-x-4 items-center">
  <input type="hidden" name="from_station_name" value="${trip.from_station_name}">
  <input type="hidden" name="to_station_name" value="${trip.to_station_name}">
  <input type="hidden" name="route" value="${trip.route}">
  <input type="hidden" name="old_seat_id" value="${trip.seat_id}">

  <!-- ปุ่ม เเสดงตั๋ว พร้อม QR Code SVG -->
  <button type="submit" 
    class="btn bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:from-blue-600 hover:to-indigo-700 flex items-center space-x-2">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path d="M3 3h3v3H3V3zm6 0h3v3H9V3zm-6 6h3v3H3V9zm6 6h3v3H9v-3zm-6 6h3v3H3v-3zm12-18h3v3h-3V3zm6 0h3v3h-3V3zm0 6h3v3h-3V9zm-6 6h3v3h-3v-3zm6 6h3v3h-3v-3zM9 9h6v6H9V9zm9 9h3v3h-3v-3zm-6-6h3v3h-3v-3z"/>
    </svg>
    <span>เเสดงตั๋ว</span>
  </button>

  <!-- ปุ่ม เปลี่ยนแปลงตั๋วโดยสาร -->
  <button type="submit" 
    class="btn bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:from-green-600 hover:to-emerald-700">
    ✏️ เปลี่ยนแปลงตั๋วโดยสาร
  </button>
</form>


	`;
  
	const renderTrip = (trip, index, showChangeButton = true) => {
	  return `
		<div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${index % 2 === 0 ? 'border-blue-500' : 'border-purple-500'}">
		  <div class="grid md:grid-cols-6 gap-6 items-center">
			<div class="col-span-3">
			  <p class="font-semibold text-lg mb-2  text-blue-800">เที่ยวโดยสาร ${trip.formatted_trip_id} ${trip.start_station_name}<span class="text-gray-400 mx-2">→</span> ${trip.end_station_name}</p>
			  <p class="text-gray-700 mb-2">จาก ${trip.from_station_name} <span class="text-gray-400 mx-2">→</span> ${trip.to_station_name}</p>
			  <p class="font-semibold text-sm mt-4">ชั้นโดยสาร-ประเภทที่นั่ง</p>
			  <p class="text-gray-700">${formatSeatType(trip.seat_type)} <span class="text-gray-400 mx-2">|</span> จำนวนที่นั่ง 1</p>
			</div>
			<div>
			  <p class="font-semibold text-sm mb-1">วันที่</p>
			  <p class="text-gray-700">${formatDateTime(trip.from_datetime).date}</p>
			  <p class="font-semibold text-sm mt-3 mb-1">ที่นั่ง</p>
			  <p class="text-gray-700">${trip.seat_id}</p>
			</div>
			<div>
			  <p class="font-semibold text-sm mb-1">เวลา</p>
			  <p class="text-gray-700">${formatDateTime(trip.from_datetime).time}</p>
			  <p class="font-semibold text-sm mt-3 mb-1">ราคา</p>
			  <p class="text-gray-700">${trip.price} บาท</p>
			</div>
			${
			  showChangeButton
				? `
				  <div class="col-span-6 md:col-span-1 flex justify-end items-center">
					${ChangeTicketForm({ trip })}
				  </div>
				`
				: ''
			}
		  </div>
		</div>
	  `;
	};
  </script>
  <div class="bg-gray-100 min-h-screen py-12">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
	  <h1 class="mb-8 text-4xl font-bold text-gray-800 text-center">รายการจองตั๋วโดยสารของคุณ</h1>
	  {#if isLoading}
		<div class="flex justify-center items-center h-64">
		  <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
		</div>
	  {:else}
		<div class="mb-12">
		  <h2 class="mb-6 text-2xl font-bold text-gray-700 flex items-center">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			การเดินทางที่กำลังจะมาถึง
		  </h2>
		  {#if upcomingTravels.length > 0}
			<div class="space-y-6">
			  {#each upcomingTravels as trip, index (trip.seat_id)}
				{@html renderTrip(trip, index, true)}
			  {/each}
			</div>
		  {:else}
			<p class="text-gray-500 text-center py-8 bg-white rounded-lg shadow">ไม่พบการเดินทางที่กำลังจะมาถึง</p>
		  {/if}
		</div>
  
		<div>
		  <h2 class="mb-6 text-2xl font-bold text-gray-700 flex items-center">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			ประวัติการเดินทาง
		  </h2>
		  {#if pastTravels.length > 0}
			<div class="space-y-6">
			  {#each pastTravels as trip, index (trip.seat_id)}
				{@html renderTrip(trip, index, false)}
			  {/each}
			</div>
		  {:else}
			<p class="text-gray-500 text-center py-8 bg-white rounded-lg shadow">ไม่พบประวัติการเดินทาง</p>
		  {/if}
		</div>
	  {/if}
	</div>
  </div>