function generateNamelist(domains) { 

  let namelist = `&share 

 wrf_core = 'ARW', 

 max_dom = ${domains.length}, 

 start_date = '2000-01-01_00:00:00', 

 end_date   = '2000-01-02_00:00:00', 

 interval_seconds = 21600, 

 io_form_geogrid = 2, 

 opt_output_from_geogrid_path = './', 

 debug_level = 0, 

/ 

 

&geogrid 

 parent_id         = 1,`; 

 

  domains.forEach((bounds, i) => { 

    const center = bounds.getCenter(); 

    namelist += ` 

 parent_grid_ratio = ${i === 0 ? 1 : 3}, 

 i_parent_start    = ${i === 0 ? 1 : 10}, 

 j_parent_start    = ${i === 0 ? 1 : 10}, 

 e_we              = 100, 

 e_sn              = 100, 

 geog_data_res     = 'default', 

 dx                = ${i === 0 ? 10000 : 3000}, 

 dy                = ${i === 0 ? 10000 : 3000}, 

 map_proj          = 'lat-lon', 

 ref_lat           = ${center.lat.toFixed(4)}, 

 ref_lon           = ${center.lng.toFixed(4)}, 

 truelat1          = ${center.lat.toFixed(4)}, 

 truelat2          = ${center.lat.toFixed(4)}, 

 stand_lon         = ${center.lng.toFixed(4)},`; 

  }); 

 

  namelist += ` 

/ 

`; 

  return namelist; 

} 