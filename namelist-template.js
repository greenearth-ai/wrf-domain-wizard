function generateNamelist(bounds, domainCount) {
  let namelist = `&share
 wrf_core = 'ARW',
 max_dom = ${domainCount},
 start_date = '2000-01-01_00:00:00',
 end_date   = '2000-01-02_00:00:00',
 interval_seconds = 21600,
 io_form_geogrid = 2,
 opt_output_from_geogrid_path = './',
 debug_level = 0,
/

&geogrid
 parent_id         = 1,`;

  for (let i = 0; i < domainCount; i++) {
    const nestFactor = 0.8 ** i;
    namelist += `
 parent_grid_ratio = ${i === 0 ? 1 : 3},
 i_parent_start    = ${i === 0 ? 1 : Math.floor((1 - nestFactor) * 100)},
 j_parent_start    = ${i === 0 ? 1 : Math.floor((1 - nestFactor) * 100)},
 e_we              = ${100 - Math.floor((1 - nestFactor) * 100)},
 e_sn              = ${100 - Math.floor((1 - nestFactor) * 100)},`;
  }

  namelist += `
 geog_data_res = 'default',
 dx = 10000,
 dy = 10000,
 map_proj = 'lat-lon',
 ref_lat   = ${bounds.getCenter().lat.toFixed(2)},
 ref_lon   = ${bounds.getCenter().lng.toFixed(2)},
 truelat1  = ${bounds.getCenter().lat.toFixed(2)},
 truelat2  = ${bounds.getCenter().lat.toFixed(2)},
 stand_lon = ${bounds.getCenter().lng.toFixed(2)},
`;
  return namelist;
}