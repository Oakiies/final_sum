<script>
  import { onMount } from 'svelte';
  import { calculateTravelTime } from '../../../lib/travelTimeCalculator.js';
  export let data;
  let { stations } = data;
  
  let selectedLine = '';
  let origin = '';
  let destination = '';
  let selectedDate = '';
  let allStations = [];
  let trips = [];
  let isLoading = false;
  let errorMessage = '';
  let noTrips = false;

  let originStationName = '';
  let destinationStationName = '';

  function updateStationNames() {
    const originStation = allStations.find(station => station.station_id === origin);
    const destinationStation = allStations.find(station => station.station_id === destination);

    originStationName = originStation ? originStation.station_name : 'ไม่ระบุ';
    destinationStationName = destinationStation ? destinationStation.station_name : 'ไม่ระบุ';
  }

  function formatDateTime(dateTime, onlyDate = false) {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    
    if (onlyDate) {
      return formattedDate;
    }
    
    const formattedTime = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    }).replace(':', '.');

    return `${formattedTime} น. (${formattedDate})`;
  }

  $: origin, destination, updateStationNames();

  onMount(async () => {
    await fetchStations();
  });

  async function fetchStations() {
    const response = await fetch('/customer/search/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ line: selectedLine }),
    });

    const result = await response.json();
    allStations = result.stations;
  }

  async function handleLineChange() {
    origin = '';
    destination = '';
    trips = [];
    await fetchStations();
  }

  async function searchTrips() {
    isLoading = true;
    errorMessage = '';
    noTrips = false;

    if (!selectedDate) {
      errorMessage = 'กรุณาเลือกวันที่เดินทาง';
      isLoading = false;
      return;
    }

    const response = await fetch('/customer/search/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line: selectedLine,
        origin,
        destination,
        date: selectedDate,
      }),
    });

    const result = await response.json();

    if (result.error) {
      errorMessage = result.error;
      trips = [];
      isLoading = false;
      return;
    }

    trips = result.trips || [];

    if (trips.length === 0) {
      noTrips = true;
    }

    isLoading = false;
  }

  async function bookTrip(trip) {
    const formData = new FormData();
    formData.append('tripId', trip.trip_id);
    formData.append('tripName', trip.trip_name);
    formData.append('startStation', trip.start_name);
    formData.append('endStation', trip.end_name);
    formData.append('date', trip.from_datetime);
    formData.append('user_from_station', originStationName);
    formData.append('user_to_station', destinationStationName);

    const response = await fetch('customer/reservation', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      window.location.href = 'customer/reservation';
    } else {
      console.error('Error saving trip to session');
    }
  }
</script>

<main class="container mx-auto px-4 md:px-8 lg:px-16 py-8 bg-gray-100 min-h-screen">
  <h1 class="text-4xl font-bold text-center mb-8 text-blue-800">ค้นหาเที่ยวโดยสารรถไฟ</h1>
  
  <div class="bg-white shadow-lg rounded-lg p-6 mb-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div>
        <label class="block text-gray-700 text-sm font-semibold mb-2" for="line">เส้นทางโดยสาร</label>
        <select 
          id="line"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          bind:value={selectedLine} 
          on:change={handleLineChange}
        >
          <option value="">--เส้นทางโดยสาร--</option>
          <option value="ne">สายตะวันออกเฉียงเหนือ (NE Line)</option>
          <option value="nl">สายเหนือ (NL Line)</option>
        </select>
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-semibold mb-2" for="origin">ต้นทาง</label>
        <select 
          id="origin"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          bind:value={origin}
        >
          <option value="">--ต้นทาง--</option>
          {#each allStations as station}
            <option value={station.station_id}>{station.station_name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-semibold mb-2" for="destination">ปลายทาง</label>
        <select 
          id="destination"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          bind:value={destination}
        >
          <option value="">--ปลายทาง--</option>
          {#each allStations as station}
            <option value={station.station_id}>{station.station_name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-semibold mb-2" for="date">วันที่เดินทาง</label>
        <input 
          id="date"
          type="date" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          bind:value={selectedDate}
        >
      </div>
    </div>

    <div class="flex justify-center">
      <button 
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" 
        on:click={searchTrips} 
        disabled={isLoading}
      >
        {isLoading ? 'กำลังค้นหา...' : 'แสดงเที่ยวโดยสาร'}
      </button>
    </div>
  </div>

  {#if errorMessage}
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p class="font-bold">เกิดข้อผิดพลาด</p>
      <p>{errorMessage}</p>
    </div>
  {/if}

  {#if noTrips}
    <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
      <p class="font-bold">ไม่พบข้อมูล</p>
      <p>ไม่พบข้อมูลเที่ยวโดยสารสำหรับการค้นหานี้</p>
    </div>
  {/if}

  {#if trips.length > 0}
    <div class="space-y-6">
      {#each trips as trip}
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-blue-600 text-white p-4">
            <h2 class="text-xl font-bold">{trip.trip_name.substring(6)} {formatDateTime(trip.from_datetime, true)}</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="font-semibold">จาก - ถึง:</p>
                <p>{originStationName} -> {destinationStationName}</p>
              </div>
              <div>
                <p class="font-semibold">เที่ยวโดยสาร:</p>
                <p>{trip.trip_id} {trip.start_name} -> {trip.end_name}</p>
              </div>
              <div>
                <p class="font-semibold">ประเภท:</p>
                <p>ชั้น {trip.available_classes}</p>
              </div>
              <div>
                <p class="font-semibold">ออกเดินทาง:</p>
                <p>{formatDateTime(trip.from_datetime)}</p>
              </div>
              <div>
                <p class="font-semibold">ถึง:</p>
                <p>{formatDateTime(calculateTravelTime(stations, originStationName, destinationStationName, trip.from_datetime))}</p>
              </div>
            </div>
            <form method="POST" action="?/saveTrip" class="mt-4">
              <input type="hidden" name="bookingInfo" value={JSON.stringify({
                tripId: trip.trip_id,
                tripName: trip.trip_name,
                startName: trip.start_name,
                endName: trip.end_name,
                fromDatetime: trip.from_datetime,
                toDatetime: calculateTravelTime(stations, originStationName, destinationStationName, trip.from_datetime),
                availableClasses: trip.available_classes,
                user_from_station: originStationName,
                user_to_station: destinationStationName
              })}>
              <button
                type="submit"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                จองตั๋ว
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if selectedLine && origin && destination && selectedDate}
    <div class="mt-8 p-4 bg-blue-100 rounded-lg text-center">
      <p class="text-blue-800">
        คุณเลือก: <span class="font-semibold">{originStationName}</span> ถึง <span class="font-semibold">{destinationStationName}</span> 
        บนสาย <span class="font-semibold">{selectedLine.toUpperCase()}</span> 
        วันที่ <span class="font-semibold">{selectedDate}</span>
      </p>
    </div>
  {/if}
</main>