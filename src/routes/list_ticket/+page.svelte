<script>
    import { formatDateTime, formatSeatType, generateChangeLink } from '$lib/utils.js';
    /** @type {import('./$types').PageData} */
    export let data;

    // แยกข้อมูลการเดินทางตามสถานะ
    let upcomingTravels = data.reservations.filter(
        (reservation) => reservation.reserve_status == "ready"
    );
    let pastTravels = data.reservations.filter(
        (reservation) => reservation.reserve_status == "used"
    );
</script>

<div class="container mx-auto p-4 py-2">
    <h1 class="text-4xl font-bold mb-4">รายการจองตั๋วโดยสารของคุณ</h1>

    <h2 class="text-2xl font-bold mb-4">การเดินทางที่กำลังจะมาถึง</h2>
    <div class="space-y-4">
        {#each upcomingTravels as trip, index (trip.id)}
        <div class={index % 2 === 0 ? 'bg-gray-200 p-4 rounded-lg shadow-md' : 'bg-white p-4 rounded-lg shadow-md'}>
            <div class="grid md:grid-cols-6 gap-4">
                <div class="col-span-3">
                    <p class="font-semibold mb-4">เที่ยวโดยสาร<span class="ml-10">จาก {trip.from_station_name} -> {trip.to_station_name}</span></p>
                    <p class="font-semibold flex">
                        <span>ชั้นโดยสาร-ประเภทที่นั่ง</span>
                        <span class="ml-10">{formatSeatType(trip.seat_type)}</span>
                        <span class="ml-10">จำนวนที่นั่ง {trip.seats}</span>
                    </p>
                </div>
                <div>
                    <p class="font-semibold mb-4">วันที่ {formatDateTime(trip.from_datetime).date}</p>
                    <p class="font-semibold">ที่นั่ง {trip.seat_id}</p>
                </div>
                <div>
                    <p class="font-semibold mb-4">เวลา {formatDateTime(trip.from_datetime).time}</p>
                    <p class="font-semibold">ราคา {trip.price} บาท</p>
                </div>
                <!-- <div class="text-right">
                    <a href={generateChangeLink(trip)}
                        use:link
                        class="inline-block bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 no-underline">
                        เปลี่ยนแปลง
                    </a>
                </div> -->
            </div>
        </div>
        {/each}
    </div>

    <h2 class="text-2xl font-bold mt-8 mb-4">ประวัติการเดินทาง</h2>
    
    {#if pastTravels.length > 0}
        <div class="space-y-4">
            {#each pastTravels as trip, index (trip.id)}
            <div class={index % 2 === 0 ? 'bg-gray-200 p-4 rounded-lg shadow-md' : 'bg-white p-4 rounded-lg shadow-md'}>
                <div class="grid md:grid-cols-6 gap-4">
                    <div class="col-span-3">
                        <p class="font-semibold mb-4">เที่ยวโดยสาร<span class="ml-10">จาก {trip.from_station_name} -> {trip.to_station_name}</span></p>
                        <p class="font-semibold flex">
                            <span>ชั้นโดยสาร-ประเภทที่นั่ง</span>
                            <span class="ml-10">{formatSeatType(trip.seat_type)}</span>
                            <span class="ml-10">จำนวนที่นั่ง {trip.seats}</span>
                        </p>
                    </div>
                    <div>
                        <p class="font-semibold mb-4">วันที่ {formatDateTime(trip.from_datetime).date}</p>
                        <p class="font-semibold">ที่นั่ง {trip.seat_id}</p>
                    </div>
                    <div>
                        <p class="font-semibold mb-4">เวลา {formatDateTime(trip.from_datetime).time}</p>
                        <p class="font-semibold">ราคา {trip.price} บาท</p>
                    </div>
                </div>
            </div>
            {/each}
        </div>
    {:else}
        <p class="text-gray-500">ไม่พบประวัติการเดินทาง</p>
    {/if}
</div>
