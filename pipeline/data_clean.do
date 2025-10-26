import delimited "202401-bluebikes-tripdata.csv", clear


gen double start_dt = clock(started_at, "YMDhms#")

gen double stop_dt  = clock(ended_at, "YMDhms#")

format start_dt stop_dt %tc

gen double start_hour = floor(start_dt/(1000*60*60)) * (1000*60*60)

gen double stop_hour  = floor(stop_dt /(1000*60*60)) * (1000*60*60)

format start_hour stop_hour %tc

gen double start_hour_end = start_hour + (1000*60*60 - 1)

gen double stop_hour_end  = stop_hour + (1000*60*60 - 1)

format start_hour_end stop_hour_end %tc

summarize start_hour stop_hour
local min_time = r(min)
local max_time = r(max)

scalar nhours = ceil((`max_time' - `min_time')/(1000*60*60)) + 1
local N = nhours

clear
set obs `N'
gen double hour_start = `min_time' + (_n-1)*(1000*60*60)
gen double hour_end   = hour_start + (1000*60*60 - 1)
format hour_start hour_end %tc
save hours.dta, replace

import delimited "202401-bluebikes-tripdata.csv", clear

keep start_station_id start_station_name
rename start_station_id stationid
rename start_station_name stationname
duplicates drop
save stations.dta, replace

use stations.dta, clear
cross using hours.dta
order stationid stationname hour_start hour_end
compress
save bikes_in.dta, replace

use stations.dta, clear
cross using hours.dta
order stationid stationname hour_start hour_end
compress
save bikes_out.dta, replace

preserve
import delimited "202401-bluebikes-tripdata.csv", clear

gen double start_dt = clock(started_at, "YMDhms#")
gen double start_hour = floor(start_dt/(1000*60*60)) * (1000*60*60)
gen double start_hour_end = start_hour + (1000*60*60 - 1)
gen byte obs = 1
collapse (count) num_bikes_out=obs, by(start_station_id start_station_name start_hour start_hour_end)
rename start_station_id stationid
rename start_station_name stationname
rename start_hour hour_start
rename start_hour_end hour_end
save temp_out.dta, replace
restore

use bikes_out.dta, clear
merge 1:1 stationid stationname hour_start hour_end using temp_out.dta
drop _merge
replace num_bikes_out = 0 if missing(num_bikes_out)
save bikes_out.dta, replace

preserve
import delimited "202401-bluebikes-tripdata.csv", clear

gen double stop_dt = clock(ended_at, "YMDhms#")
gen double stop_hour = floor(stop_dt/(1000*60*60)) * (1000*60*60)
gen double stop_hour_end = stop_hour + (1000*60*60 - 1)
gen byte obs = 1
collapse (count) num_bikes_in=obs, by(end_station_id end_station_name stop_hour stop_hour_end)
rename end_station_id stationid
rename end_station_name stationname
rename stop_hour hour_start
rename stop_hour_end hour_end
save temp_in.dta, replace
restore

use bikes_in.dta, clear
merge 1:1 stationid stationname hour_start hour_end using temp_in.dta
drop _merge
replace num_bikes_in = 0 if missing(num_bikes_in)
save bikes_in.dta, replace

use bikes_out.dta, clear
merge 1:1 stationid stationname hour_start hour_end using bikes_in.dta
drop _merge

replace num_bikes_in  = 0 if missing(num_bikes_in)
replace num_bikes_out = 0 if missing(num_bikes_out)

save bikes_inout_202401.dta, replace

 use bikes_inout_202401.dta, clear


gen double Date = dofc(hour_start)

format Date %td

save "202401-bluebikes-tripdata.dta", replace

merge m:1 Date using weather.dta

drop _merge SNWD

gen date_only = dofc(hour_start)

format date_only %td

gen dow = dow(date_only)

gen hr = hh(hour_start)

gen month = month(date_only)

gen weekend = inlist(dow,0,6)

gen weekhour = dow*24 + hr

sort stationid hour_start 

by stationid: gen next_bike_in = num_bikes_in[_n+1]

by stationid: gen next_bike_out = num_bikes_out[_n+1]

drop if missing(stationid)

save "202401-bluebikes-tripdata.dta", replace



// use "bikes_inout_total.dta", clear
// append using "202401-bluebikes-tripdata.dta", force
// sort stationname hour_start
// save "bikes_inout_total.dta", replace
