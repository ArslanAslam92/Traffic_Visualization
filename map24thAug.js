//let accidents = {};
//let fatalities = {};
let timestamp = -1;
let trafficVariable = 1; // 1=ttiSelected, 2=speedSelected
let visType = 1;         // 1=color1, 2=color2, 3=width, 4=both1, 5=both2
let selectedTime = 0;
let spatialLayer = 0;    // 0 : segment, 1: Sections, 2: Routes
let allRoutesData = [];
let filteredData = [];   // applies getkey and saves
let yearChange = 0;
let monthChange = 0;
let dateSlider = "FALSE";
let currentSelectedSpatial = "Segment";

let roadDirection  = "FALSE";
$( function() {
  // $("#datepicker").datepicker();
  $( "#datepicker" ).datepicker({ 
  // minDate: new Date(2019, 6 - 1, 01), 
  // maxDate: new Date(2019, 6 - 1, 30) ,
  // defaultDate: new Date('1 June 2019'),
  onSelect: function(dateText) {
    console.log("Selected date: " + dateText + "; input's current value: " + this.value);
    
    let currentDate = $("#datepicker").datepicker("getDate");
    var formatted = $.datepicker.formatDate('yymmdd', currentDate);
    console.log(formatted);
    timestamp = formatted;
    //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
    roadDirection = "FALSE";
    console.log(roadDirection);
    filterData(formatted);
    redraw();
  }
}).on('change', function(){
  console.log("DATE CHANGED");
});
// .datepicker('setDate', date);
 $('#datepicker').datepicker("setDate", new Date('1 June 2019'));

var handle = $( "#custom-handle" );
$( "#timeSlider" ).slider({
  min: 0,
  max: 1440,
  value: selectedTime,
  step: 60,
  create: function() {
    // handle.text( $( this ).slider( "value" ) );
  },
  slide: function( event, ui ) {
    // handle.text( ui.value );
    var hours = Math.floor(ui.value / 60);

    if(hours.toString().length == 1) hours = '0' + hours;


    selectedTime = hours;
    redraw();

    $('#something').html(hours);
  }
});
} );
const {DeckGL, GeoJsonLayer} = deck;

let check = "GOr";

const TTI_COLOR = d3.scaleThreshold()
.domain([0.8, 1.251, 1.51, 1.751, 2.01, 2.51, 14])
.range([
  [0, 0, 0, 127],
  [26, 152, 80],
  [145, 207, 96],
  [217, 239, 139],
  [254, 224, 139],
  [252, 141, 89],
  [215, 48, 39]
  //[168, 0, 0]
  ]);

const SPEED_COLOR = d3.scaleThreshold()
.domain([1, 10.01, 20.01, 30.01, 40.01, 50.01, 95.01])
.range([
  [0, 0, 0, 127],
  [215, 48, 39],
  [252, 141, 89],
  [254, 224, 139],
  [217, 239, 139],
  [145, 207, 96],
  [26, 152, 80],
  [0, 51, 0]
  ]);

const TTI_COLOR2 = d3.scaleThreshold()
.domain([0.8, 1.251, 1.51, 1.751, 2.01, 2.51, 14])
.range([
  [0, 0, 0, 127],
  [241, 238, 246],
  [212, 185, 218],
  [201, 148, 199],
  [223, 101, 176],
  [221, 28, 119],
  [152, 0, 67]
  //[168, 0, 0]
  ]);

const SPEED_COLOR2 = d3.scaleThreshold()
.domain([1, 10.01, 20.01, 30.01, 40.01, 50.01, 95.01])
.range([
  [0, 0, 0, 127],
  [152, 0, 67],
  [221, 28, 119],
  [223, 101, 176],
  [201, 148, 199],
  [212, 185, 218],
  [241, 238, 246],
  [0, 51, 0]
  ]);

const TTI_WIDTH = d3.scaleThreshold()
.domain([0.8, 1.251, 1.51, 1.751, 2.01, 2.51, 14])
.range([2, 10, 20, 30, 40, 50, 60]);

const SPEED_WIDTH = d3.scaleThreshold()
.domain([1, 10.01, 20.01, 30.01, 40.01, 50.01, 95.01])
.range([2, 60, 50, 40, 30, 20, 10]);

//const WIDTH_SCALE = d3.scaleLinear()
//.clamp(true)
//.domain([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 14])
//.range([0,90]);
// const WIDTH_SCALE = function (x){
//    return x/10;
// }
//legend1();
changelegend();

$('input[type=radio][name=optradio]').change(function() {
  if (this.value == 'daily') {
  
  // $('#dateselector').datepicker("setDate", new Date('1 June 2019'));
  //$('#datepicker').show();
  $('#calendar').show();
  $('#dateSlider').hide();
  $('#timeSliderContainer').hide();
  $('#year-month').hide();

  // $('#datePicker').datepicker('setDate', new Date('1 June 2019'));
  let currentDate = $("#datepicker").datepicker("getDate");
    var formatted = $.datepicker.formatDate('yymmdd', currentDate);
    console.log(formatted);
    timestamp = formatted;
  // timestamp = "20190601";
  //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
  roadDirection = "FALSE";
  if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
    loadRouteData();
    spatialLayer = 2;
  }
  else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
    loadSegmentData();
    spatialLayer = 0;

  }
  else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
    loadSectionData();
    spatialLayer = 1;
  }
  console.log(timestamp);
  filterData(timestamp);
  redraw();
    // alert("DAILY");
  }
  else if (this.value == '15min') {
    // alert("15min");
    $('#timeSliderContainer').hide();
    $('#calendar').show();
    $('#dateSlider').show();
    $('#year-month').hide();
  }
  else if (this.value == 'hourly'){
  	$('#calendar').show();
    $('#dateSlider').hide();
    $('#timeSliderContainer').show();
    $('#year-month').hide();
  }
 
  else if(this.value == 'yearly'){
    console.log("IN YEARLY");

    //$('#datepicker').hide();
    $('#calendar').hide();
    $('#dateSlider').hide();
    $('#timeSliderContainer').hide();
    $('#year-month').show();
    $('#yearSelector').show();
    $('#monthSelector').hide();
  }
  else if(this.value == 'monthly'){
    //$('#datepicker').hide();
    $('#calendar').hide();
    $('#dateSlider').hide();
    $('#timeSliderContainer').hide();
    $('#year-month').show();
    $('#yearSelector').show();
    $('#monthSelector').show();
    // loadSegmentData();

    // let spatailLayerSelector = $('input[type="radio"][name="spatioradio"]:checked');
    
   
  }
 
  if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
    loadRouteData();
    spatialLayer = 2;
  }
  else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
    loadSegmentData();
    spatialLayer = 0;

  }
  else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
    loadSectionData();
    spatialLayer = 1;
  }
});

// $('input[type=radio][name=direction]').change(function() {

//   //roadDirection = this.value;
//   roadDirection = "FALSE"

//   if(this.value == 'TRUE'){
//     roadDirection = "FALSE";
//   }
//   else{
//     roadDirection = "FALSE";
//   }
//   console.log(timestamp);
//   console.log(this.value);
//   filterData(timestamp);
//   redraw();
// });

$('input[type=radio][name=variableRadio]').change(function() {
  if(this.value == 'ttiSelected'){
  	trafficVariable = 1;
  	changelegend();
  }
  else if(this.value == 'speedSelected'){
  	trafficVariable = 2;
  	changelegend();
  }
  redraw();  
});

$('input[type=radio][name=typeRadio]').change(function() {
  if(this.value == 'colorSelected'){
    visType = 1;
    changelegend();
  }
  else if(this.value == 'color2Selected'){
    visType = 2;
    changelegend();
  }
  else if(this.value == 'widthSelected'){
    visType = 3;
    changelegend();
  }
  else if(this.value == 'bothSelected'){
    visType = 4;
    changelegend();
  }
  else if(this.value == 'both2Selected'){
    visType = 5;
    changelegend();
  }
  redraw();
});


$('input[type=radio][name=spatioradio]').change(function() {

  if(this.value == 'route'){
    loadRouteData();
    spatialLayer = 2;
    currentSelectedSpatial = "Route";
  }
  else if(this.value == 'segment'){
    loadSegmentData();
    spatialLayer = 0;
    currentSelectedSpatial = "Segment";

  }
  else if(this.value == 'section'){
    loadSectionData();
    spatialLayer = 1;
    currentSelectedSpatial = "Section";
  }
  //else{
  //  spatialLayer = 1;
  //}
});

$('input[type=radio][name=bmapRadio]').change(function() {

  if(this.value == 'dark'){
    deckgl._map._map.setStyle('mapbox://styles/mapbox/dark-v10');
  }
  else if(this.value == 'light'){
    deckgl._map._map.setStyle('mapbox://styles/mapbox/light-v10');
  }
  // else if(this.value == 'streets'){
  //   deckgl._map._map.setStyle('mapbox://styles/mapbox/streets-v11');
  // }
  // else if(this.value == 'outdoors'){
  //   deckgl._map._map.setStyle('mapbox://styles/mapbox/outdoors-v11');
  // }
  // else if(this.value == 'navigationm'){
  //   deckgl._map._map.setStyle('mapbox://styles/mapbox/navigation-guidance-day-v4');
  // }
  else if(this.value == 'satellite'){
    deckgl._map._map.setStyle('mapbox://styles/mapbox/satellite-v9');
  }
  else if(this.value == 'navigationn'){
    deckgl._map._map.setStyle('mapbox://styles/mapbox/navigation-guidance-night-v4');
  }
  console.log(basem);
  //redraw();
});

$('#year-value').on('change', function() {
  dateChange = 0;
  if(yearChange == 0){
    yearChange = 1;
  }
  else{
     yearChange = 0;
  }
  filterAggData();
  redraw();
});

$('#month-value').on('change', function() {
  if(monthChange == 0){
    monthChange = 1;
  }
  else{
     monthChange = 0;
  }
  filterAggData();
  redraw();
});

function changelegend(){
	if($('input[type="radio"][name="typeRadio"]:checked').val() == 'colorSelected'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
    	legend1();
    }
    	else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
    	legend2();
    }
  }
  	else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'color2Selected'){
  	    if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
    	legend3();
    }
    	else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
    	legend4();
    }
  }
  	else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'widthSelected'){
  		if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
    	legend5();
    }
    	else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
    	legend6();
    }
  }
  	else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'bothSelected'){
  	    if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
    	legend7();
    }
    	else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
    	legend8();
    }
  }
    else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'both2Selected'){
  	if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
    	legend9();
    }
    else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
    	legend10();
    }
  }
}


var deckgl = new deck.DeckGL({
  initialViewState: {
    longitude: 13.0385674,
    latitude: 47.8243466,
    zoom: 13,
    pitch: 0,
    minZoom: 2,
    maxZoom: 18
  },
  controller: true,
  mapboxApiAccessToken: 'pk.eyJ1IjoiYXJzbGFuYXNsYW0iLCJhIjoiY2p3eHluaTc0MDY2bTN5dGE5MmFreDVhNiJ9.m7-X9A_ArfFo7elXXyaSIQ',
  mapStyle: 'mapbox://styles/mapbox/dark-v10',
  pickingRadius: 5,
  layers: [],
  getTooltip
});
loadSegmentData();
//d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/accidents.csv')
//d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/accidentsss.csv')
//d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/sample.csv')
//d3.csv('http://localhost/ARSI/route1Jan.csv')

function loadSegmentData(){
  console.log('LOAD SEGMENT');
  let currentDate = $("#datepicker").datepicker("getDate");
  console.log(currentDate);
  var formatted = $.datepicker.formatDate('yymmdd', currentDate);
  console.log(formatted);
  dateSelected = formatted;
  console.log(dateSelected);

  // d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19tti.csv')
  console.log($('input[type="radio"][name="optradio"]:checked').val());
  if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly' || $('input[type="radio"][name="optradio"]:checked').val() == 'monthly'){
   
    console.log("inYearly");
    $('#year-month').show();
    //d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/segment_agg.csv')	//TRUE & FALSE
    d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/segmentt_agg.csv')		//all FALSE
    .then(data => {
      allRoutesData = data;
      // const unique = [...new Set(data.map(item => item.timestamp))];
      // timestamp = data[0].timestamp;
      // initTimeSlider(d3.select('#dateSlider'));
      //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
      roadDirection = "FALSE";
      // filterData('20190601');
      filterAggData();
      redraw();
    });
  }
  
  else{
    //d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19ttii.csv')         	//bidirectional?
    //d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19_insegmentt.csv')		//ingoing TRUE & FALSE
    d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19_insegmenttt.csv')		//all FALSE
    .then(data => {
      allRoutesData = data;
      const unique = [...new Set(data.map(item => item.timestamp))];
      timestamp = data[0].timestamp;
      if(dateSlider == "FALSE"){
        initTimeSlider(d3.select('#dateSlider'));
        dateSlider = "TRUE";
      }
      //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
      roadDirection = "FALSE";
      
      filterData(dateSelected);
      redraw();
    });
  }
  
}

function loadRouteData(){
  let currentDate = $("#datepicker").datepicker("getDate");
  var formatted = $.datepicker.formatDate('yymmdd', currentDate);
  console.log(formatted);
  dateSelected = formatted;

  console.log('LOAD ROUTE');
  console.log($('input[type="radio"][name="optradio"]:checked').val());
  if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly' || $('input[type="radio"][name="optradio"]:checked').val() == 'monthly'){
    console.log("inYearly");
    $('#year-month').show();
    d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/route_agg.csv')
    .then(data => {
      allRoutesData = data;
      // const unique = [...new Set(data.map(item => item.timestamp))];
      // timestamp = data[0].timestamp;
      // initTimeSlider(d3.select('#dateSlider'));
      //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
      roadDirection = "FALSE";
      // filterData('20190601');
      filterAggData();
      redraw();
    });
  }
  else{
    //d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19_route.csv')   //bidirectional?
    d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19_inroute.csv')   //ingoing
    .then(data => {
      allRoutesData = data;
      const unique = [...new Set(data.map(item => item.timestamp))];
      timestamp = data[0].timestamp;
      if(dateSlider == "FALSE"){
        initTimeSlider(d3.select('#dateSlider'));
        dateSlider = "TRUE";
      }
      //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
      roadDirection = "FALSE";
      filterData(dateSelected);
      redraw();
    });
  }
}

function loadSectionData(){
  console.log('LOAD SECTION');
  let currentDate = $("#datepicker").datepicker("getDate");
  var formatted = $.datepicker.formatDate('yymmdd', currentDate);
  console.log(formatted);
  dateSelected = formatted;
  if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly' || $('input[type="radio"][name="optradio"]:checked').val() == 'monthly'){
    console.log("inYearly");
    $('#year-month').show();
    d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/section_agg.csv')
    .then(data => {
      allRoutesData = data;
      // const unique = [...new Set(data.map(item => item.timestamp))];
      // timestamp = data[0].timestamp;
      // initTimeSlider(d3.select('#dateSlider'));
      //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
      roadDirection = "FALSE";
      // filterData('20190601');
      filterAggData();
      redraw();
    });
  }
  else{
    //d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19_section.csv')		//ingoing as well
    d3.csv('https://raw.githubusercontent.com/ArslanAslam92/files/master/june19_insection.csv')		//ingoing
    .then(data => {
      allRoutesData = data;
      const unique = [...new Set(data.map(item => item.timestamp))];
      timestamp = data[0].timestamp;
      if(dateSlider == "FALSE"){
        initTimeSlider(d3.select('#dateSlider'));
        dateSlider = "TRUE";
      }
      //roadDirection = $('input[type="radio"][name="direction"]:checked').val();
      roadDirection = "FALSE";
      
      filterData(dateSelected);
      redraw();
    });
  }
}

// Update deck.gl layers
function redraw() {
  console.log("REDRAW");

  const layers = [
  new GeoJsonLayer({
    id: 'geojson',
    //data: 'https://raw.githubusercontent.com/ArslanAslam92/files/master/roads.json',
    data: 'https://raw.githubusercontent.com/ArslanAslam92/files/master/segments.json',
    //data: 'https://raw.githubusercontent.com/ArslanAslam92/files/master/segments1.json', //section id converted to int
    stroked: true,
    filled: true,
    extruded: false,
    wireframe: true,
    autoHighlight: true,
    highlightColor: '#000480',
    lineJointRounded: true,
    lineWidthMinPixels: 3,
    parameters: {
      depthTest: true
    },

    getLineColor: getLineColor,
    getLineWidth: getLineWidth,

//getLineColor: [255, 0, 0],
    getElevation: 2000,
    // getLineWidth: 6,
    pickable: true,
    onClick: (event) =>{
      console.log(event);
      console.log(event.object.properties.segment_id);
      if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
        getDataForGraph(event.object.properties.route_id);
      }
      else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
        getDataForGraph(event.object.properties.section_id);
      }
      else{
        getDataForGraph(event.object.properties.segment_id);
      }
      $('.graph-panel').show();
    },

    updateTriggers: {
      getLineColor: {timestamp,selectedTime,spatialLayer,trafficVariable,visType,yearChange,monthChange},
      getLineWidth: {timestamp,selectedTime,spatialLayer,trafficVariable,visType,yearChange,monthChange}
    },

    transitions: {
      getLineColor: 500,
      getLineWidth: 500
    }
    })
  ];

  deckgl.setProps({layers});
}

function getKey(keyProps) {
  let keyId ;
  if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
    keyId =  `${keyProps.route_id}`;
    return keyId;
  }
  else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
    keyId =  `${keyProps.segment_id}`;
    return keyId;
  }    
  else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
    keyId =  `${keyProps.section_id}`;
    return keyId;
  }
  else{
    keyId =  `${keyProps.segment_id}`;
    return keyId;
  }

}

function getRouteKey(keyProps){
  var route_id = `${keyProps.segment_id}`
  return segment_id;
}


function getLineColor(f) {
  // if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly'){
  //   getLineColorOfAggDataYearly(f);    
  // }
  let colorOptionEnabled = false;
  let colorOption2Enabled = false;
  if($('input[type="radio"][name="typeRadio"]:checked').val() == 'colorSelected'){
    colorOptionEnabled = true;
  }
  else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'color2Selected'){
  	colorOption2Enabled = true;
  }
  else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'bothSelected'){
  	colorOptionEnabled = true;
  }
    else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'both2Selected'){
  	colorOption2Enabled = true;
  }
  else{
    colorOptionEnabled = false;
    colorOption2Enabled = false;
  }

  //check color is selected in panel
  if(colorOptionEnabled){
    let timeInterval,hour,columnNamesForHour ;
    if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){
      hour = selectedTime;
    //console.log(hour);
    columnNamesForHour =  timeline.filter(function (el) {
     return el.hour == hour;
   }); 

  }
  else{

    timeInterval = getDateInterval(selectedTime);
  }

  const key = getKey(f.properties);
  let currentFeatureData = []; //this will save data of one segment/route/selection
  if(filteredData.length != 0){
    if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
      currentFeatureData = filteredData.filter(function (el) {
          return el.route_id == key 
        });
    }
    else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
      currentFeatureData = filteredData.filter(function (el) {

        return el.segment_id == key 
      });
    }
    else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
      currentFeatureData = filteredData.filter(function (el) {

        return el.section_id == key 
      });
    }

    if(currentFeatureData.length != 0){
      if($('input[type="radio"][name="optradio"]:checked').val() == '15min'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR(currentFeatureData[0][timeInterval.name]);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR(currentFeatureData[0][timeInterval.speed]);
        }
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          let ttiValueArray = [];
          columnNamesForHour.forEach(column => {
            let ttiColumnValue = currentFeatureData[0][column.name];
            ttiValueArray.push(parseFloat(ttiColumnValue));
          });
          const sum = ttiValueArray.reduce((a, b) => a + b, 0);
          const avg = (sum / ttiValueArray.length) || 0;
          return TTI_COLOR(avg);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
            let speedValueArray = [];
            columnNamesForHour.forEach(column => {
              let ttiColumnValue = currentFeatureData[0][column.speed];
              speedValueArray.push(parseFloat(ttiColumnValue));
            });
            const sum = speedValueArray.reduce((a, b) => a + b, 0);
            const avg = (sum / speedValueArray.length) || 0;
            return SPEED_COLOR(avg);
        }
        
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'daily'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR(currentFeatureData[0]['averageTTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR(currentFeatureData[0]['v_avg']);
        }
        
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly'){
        console.log("IM IN YEAR INSIDE COLOR");
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR(currentFeatureData[0]['TTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR(currentFeatureData[0]['v']);
        }

      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'monthly'){
        console.log("IM IN YEAR INSIDE COLOR");
        console.log(currentFeatureData);
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR(currentFeatureData[0]['TTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR(currentFeatureData[0]['v']);
        }
      }
    }
    else{
      return TTI_COLOR(0);
    }
  }
  else{
    return TTI_COLOR(0);
  }
  }

  if(colorOption2Enabled){
    let timeInterval,hour,columnNamesForHour ;
    if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){
      hour = selectedTime;
    //console.log(hour);
    columnNamesForHour =  timeline.filter(function (el) {
     return el.hour == hour;
   }); 

  }
  else{

    timeInterval = getDateInterval(selectedTime);
  }

  const key = getKey(f.properties);
  let currentFeatureData = []; //this will save data of one segment/route/selection
  if(filteredData.length != 0){
     if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
      currentFeatureData = filteredData.filter(function (el) {
          return el.route_id == key 
        });
    }
    else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
      currentFeatureData = filteredData.filter(function (el) {
        return el.segment_id == key 
      });
    }
    else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
      currentFeatureData = filteredData.filter(function (el) {
        return el.section_id == key 
      });
    }

    if(currentFeatureData.length != 0){
      if($('input[type="radio"][name="optradio"]:checked').val() == '15min'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR2(currentFeatureData[0][timeInterval.name]);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR2(currentFeatureData[0][timeInterval.speed]);
        }
        
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          let ttiValueArray = [];
          columnNamesForHour.forEach(column => {
            let ttiColumnValue = currentFeatureData[0][column.name];
            ttiValueArray.push(parseFloat(ttiColumnValue));
          });
          const sum = ttiValueArray.reduce((a, b) => a + b, 0);
          const avg = (sum / ttiValueArray.length) || 0;
          return TTI_COLOR2(avg);
         
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
            let speedValueArray = [];
            columnNamesForHour.forEach(column => {
              let ttiColumnValue = currentFeatureData[0][column.speed];
              speedValueArray.push(parseFloat(ttiColumnValue));
            });
            const sum = speedValueArray.reduce((a, b) => a + b, 0);
            const avg = (sum / speedValueArray.length) || 0;
            return SPEED_COLOR2(avg);
        }
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'daily'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR2(currentFeatureData[0]['averageTTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR2(currentFeatureData[0]['v_avg']);
        }
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly'){
        console.log("IM IN YEAR INSIDE COLOR");
        console.log(currentFeatureData);
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR2(currentFeatureData[0]['TTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR2(currentFeatureData[0]['v']);
        }
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'monthly'){
        console.log("IM IN YEAR INSIDE COLOR");
        console.log(currentFeatureData);
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_COLOR2(currentFeatureData[0]['TTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_COLOR2(currentFeatureData[0]['v']);
        }
      }
    }
    else{
      return TTI_COLOR2(0);
    }
  }
  else{
    return TTI_COLOR2(0);
  }
  }

  else{
    return [254,224,139];
  }
  
}

function getLineWidth(f) {
  // if (!incidents[timestamp]) {
  //   return 10;
  // }
  // const key = getKey(f.properties);
  // const incidentsPer1KMile = ((incidents[timestamp][key] || 0) / 10) * 1000;

  let lineWidthEnabled = false;
   if($('input[type="radio"][name="typeRadio"]:checked').val() == 'widthSelected'){

    lineWidthEnabled = true;
  }
  else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'bothSelected'){
  	lineWidthEnabled = true;
  }
   else if($('input[type="radio"][name="typeRadio"]:checked').val() == 'both2Selected'){
  	lineWidthEnabled = true;
  }
  else{ 
    lineWidthEnabled = false;
  }
  if(lineWidthEnabled){
    let timeInterval,hour,columnNamesForHour ;
    if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){
      hour = selectedTime;
    //console.log(hour);
    columnNamesForHour =  timeline.filter(function (el) {
     return el.hour == hour;
   }); 

  }
  else{

    timeInterval = getDateInterval(selectedTime);
  }


  const key = getKey(f.properties);
  let currentFeatureData = []; //this will save data of one segment/route/selection
  if(filteredData.length != 0){
   

     if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
      currentFeatureData = filteredData.filter(function (el) {
          return el.route_id == key 
        });
    }
    else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
      currentFeatureData = filteredData.filter(function (el) {

        return el.segment_id == key 
      });
    }
    else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
      currentFeatureData = filteredData.filter(function (el) {

        return el.section_id == key 
      });
    }

    if(currentFeatureData.length != 0){
      if($('input[type="radio"][name="optradio"]:checked').val() == '15min'){
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_WIDTH(currentFeatureData[0][timeInterval.name]);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_WIDTH(currentFeatureData[0][timeInterval.speed]);
        }
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){

        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          let ttiValueArray = [];
          columnNamesForHour.forEach(column => {
            let ttiColumnValue = currentFeatureData[0][column.name];
            ttiValueArray.push(parseFloat(ttiColumnValue));
          });
          const sum = ttiValueArray.reduce((a, b) => a + b, 0);
          const avg = (sum / ttiValueArray.length) || 0;
          return TTI_WIDTH(avg);
         
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
            let speedValueArray = [];
            columnNamesForHour.forEach(column => {
              let ttiColumnValue = currentFeatureData[0][column.speed];
              speedValueArray.push(parseFloat(ttiColumnValue));
            });
            const sum = speedValueArray.reduce((a, b) => a + b, 0);
            const avg = (sum / speedValueArray.length) || 0;
            return SPEED_WIDTH(avg);
        }
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'daily'){
         if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_WIDTH(currentFeatureData[0]['averageTTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_WIDTH(currentFeatureData[0]['v_avg']);
        }
      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly'){
        console.log("IM IN YEAR INSIDE COLOR");
        console.log(currentFeatureData);
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_WIDTH(currentFeatureData[0]['TTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_WIDTH(currentFeatureData[0]['v']);
        }

      }
      else if($('input[type="radio"][name="optradio"]:checked').val() == 'monthly'){
        console.log("IM IN MONTH INSIDE COLOR");
        console.log(currentFeatureData);
        if($('input[type="radio"][name="variableRadio"]:checked').val() == 'ttiSelected'){
          return TTI_WIDTH(currentFeatureData[0]['TTI']);
        }
        else if($('input[type="radio"][name="variableRadio"]:checked').val() == 'speedSelected'){
          return SPEED_WIDTH(currentFeatureData[0]['v']);
        }
      }
    }
    else{ 						//if current feature data length is zero
      //return SPEED_WIDTH(0);
      return 5;					//show this width for no data
    }
  }
  else{ 						//if filtered data length is zero
    //return SPEED_WIDTH(0);
    return 5;					//show this width for no data
  }

  }
  else{ 						//if line width not enabled. i.e. this set width for when colors are enabled
    return 15;
}
  
}

/* UI */

// function initInputs(container) {
//   const inputValue = container.append('div').text(`DATE: ${timestamp}`);
//   const timestampRange = Object.keys(incidents).map(Number);

//   const input = container.append('input').attr('type', 'range')
//     .attr('min', d3.min(timestampRange))
//     .attr('max', d3.max(timestampRange))
//     .attr('step', 1)
//     .attr('value', timestamp)
//     .on('input', () => {
//       timestamp = input.property('value');
//       inputValue.text(`DATE: ${timestamp}`);
//       roadDirection = $('input[type="radio"][name="direction"]:checked').val();
//       filterData(timestamp);
//       redraw();
//     });
// }
function initTimeSlider(container) {
  const inputValue = container.append('div').text(`Time: ${selectedTime}`);


  const input = container.append('input').attr('type', 'range')
  .attr('min', 0)
  .attr('max', 95)
  .attr('step', 1)
  .attr('value', selectedTime)
  .on('input', () => {
    timeval = input.property('value');
    console.log(timeval);
    console.log(selectedTime);
    
    selectedTime = timeval;
    
    console.log(selectedTime);
    let tInterval = getDateInterval(selectedTime)
    inputValue.text(`TIME ${tInterval.start} to ${tInterval.end} `);
    redraw();
  });
}


function getDateInterval(time){
  // console.log(time);
  let timeIntervalIndex = timeline.findIndex(x => x.index == time);
  // console.log(timeIntervalIndex);

  let timeInterval = timeline[timeIntervalIndex];

  // console.log(timeInterval);
  return timeInterval;
}

function getHour(time){
// console.log(time);

let timeIntervalIndex = timeline.findIndex(x => x.index == time);
let timeInterval = timeline[timeIntervalIndex];

return timeInterval.hour;
}

function filterData(date){
  console.log(date);
  console.log(allRoutesData);
  console.log(roadDirection);
  if(date == null || date == ""){
    date = "20190601";
  }
  console.log(date);
  if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
    filteredData = allRoutesData.filter(function (el) {
      return el.timestamp == date;
    });
  }
  else{
    filteredData = allRoutesData.filter(function (el) {
      return el.timestamp == date &&
      el.direction_1 == roadDirection;
    });
  }
  
  console.log(filteredData);
}

function filterAggData(){
  // alert($('#year-value').val());
 if($('input[type="radio"][name="optradio"]:checked').val() == 'yearly'){
  filteredData = allRoutesData.filter(function (el) {
      return el.year == $('#year-value').val() &&
      el.direction_1 == roadDirection && el.month == 0 ;
    });
    console.log(filteredData);
 }
 else{
  filteredData = allRoutesData.filter(function (el) {
      return el.year == $('#year-value').val() &&
      el.direction_1 == roadDirection && el.month == $('#month-value').val() ;
    });
  console.log(filteredData);
 }
  
}

function getTooltip(info) {
  const props = info.object ? info.object.properties : null;
  let content = '';

  let infoString = undefined;

  let timeInterval,hour;


  if (props) {
    if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){
      hour = selectedTime;
      //console.log(hour);
      columnNamesForHour =  timeline.filter(function (el) {
       return el.hour == hour;
     }); 

    }
    else{

      timeInterval = getDateInterval(selectedTime);
    }
    const key = getKey(props);
    let r = undefined;
    let f = undefined;

    let tti = undefined;
    let speed = undefined;
    let date = undefined;
    let direction = undefined;
    let hours = undefined;

    let currentFeatureData = [];
    if(filteredData.length != 0){
        // currentFeatureData = filteredData.filter(function (el) {
        //     return el.segment_id == key 
        // });

         if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
            currentFeatureData = filteredData.filter(function (el) {
                return el.route_id == key 
              });
          }
          else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
            currentFeatureData = filteredData.filter(function (el) {

              return el.segment_id == key 
            });
          }
          else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
            currentFeatureData = filteredData.filter(function (el) {

              return el.section_id == key 
            });
          }
        // console.log(currentFeatureData);
        if(currentFeatureData.length != 0){
          if($('input[type="radio"][name="optradio"]:checked').val() == '15min'){
            tti = currentFeatureData[0][timeInterval.name];
            speed = currentFeatureData[0][timeInterval.speed];

            infoString = `TTI : ${tti} , Speed : ${speed} , Date : ${currentFeatureData[0]['timestamp']} , ${timeInterval.start} to ${timeInterval.end}`;
          }
          else if($('input[type="radio"][name="optradio"]:checked').val() == 'hourly'){
            let ttiValueArray = [];
            let speedValueArray = [];
            let direction = "";
            let datadate;


            columnNamesForHour.forEach(column => {
              let ttiColumnValue = currentFeatureData[0][column.name];
              let speedColumnValue = currentFeatureData[0][column.speed];
              direction = currentFeatureData[0]['direction_1'];
              datadate = currentFeatureData[0]['timestamp'];
              ttiValueArray.push(parseFloat(ttiColumnValue));
              speedValueArray.push(parseFloat(speedColumnValue));
            });
            const sum = ttiValueArray.reduce((a, b) => a + b, 0);
            const avg = (sum / ttiValueArray.length) || 0;

            const speedSum = speedValueArray.reduce((a, b) => a + b, 0);
            const speedAvg = (speedSum / speedValueArray.length) || 0;
            tti =  avg;
            hours = hour;
            speed = speedAvg;
            infoString = `TTI : ${tti} ,Speed : ${speed}, Date : ${datadate} , ${hours} hrs`;
          }
          else if($('input[type="radio"][name="optradio"]:checked').val() == 'daily'){
            tti =currentFeatureData[0]['averageTTI'];
            speed =currentFeatureData[0]['v_avg'];
            infoString = `TTI : ${tti} ,Speed : ${speed} , Date : ${currentFeatureData[0]['timestamp']} `;

          }
          else if ($('input[type="radio"][name="optradio"]:checked').val() == 'yearly'){
            tti =currentFeatureData[0]['TTI'];
            speed =currentFeatureData[0]['v'];
            infoString = `TTI : ${tti} ,Speed : ${speed} , Year : ${$('#year-value').val()} `;
          }
          else if ($('input[type="radio"][name="optradio"]:checked').val() == 'monthly'){
            tti =currentFeatureData[0]['TTI'];
            speed =currentFeatureData[0]['v'];
            infoString = `AVG TTI : ${tti} ,Speed : ${speed} , Year : ${$('#year-value').val()} Month: ${$('#month-value').val()} `;
          }

         // f = currentFeatureData[0][timeInterval.name];
         // t = currentFeatureData[0].timestamp;

       }
       else{
        r = undefined;
        f = undefined;

      }
    }


  // segment_id,timestamp,incidents,fatalities
  let content = "" ;

  if ($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
    content = `<big>Route Id : ${props.route_id} </big>`;
  }
  else if ($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
    content = `<big>Section Id : ${props.section_id} </big>`;
  }
  else{
    content = `<big>Segment Id :${props.segment_id} </big>`;
  }
  if (infoString) {
//       content += `
// <div>
//   <b>${f}</b> people died in
//   <b>${r}</b> crashes
//   on ${props.type === 'SR' ? props.state : props.type}-${props.id}
//   in <b>${timestamp}</b>
// </div>`;
content += `
<div> 
</div>
<div>${infoString}</div>
`;
} else {
  content += `<div>no accidents recorded in <b>${timestamp}</b></div>`;
}
return {html: content};
} else {
  return null;
}
}

function getDataForGraph(key){

  let currentFeatureData = [];
  if(filteredData.length != 0){
    if($('input[type="radio"][name="spatioradio"]:checked').val() == 'route'){
      if($('input[type="radio"][name="optradio"]:checked').val()  == 'yearly'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.route_id == key && el.direction_1 == roadDirection && el.month == 0;
        });
        drawYearlyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'monthly'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.route_id == key && el.year == $('#year-value').val() && el.direction_1 == roadDirection && el.month != 0;
        });
        drawMonthlyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'daily'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.route_id == key && el.direction_1 == roadDirection;
        });
        drawDailyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'hourly'){
         currentFeatureData = filteredData.filter(function (el) {
          return el.route_id == key 
        });
        drawHourlyGraph(currentFeatureData[0],key);
      }
      else{
        currentFeatureData = filteredData.filter(function (el) {
          return el.route_id == key 
        });
        drawGraph(currentFeatureData[0],key);
      }
    }

      else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'section'){
        if($('input[type="radio"][name="optradio"]:checked').val()  == 'yearly'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.section_id == key && el.direction_1 == roadDirection && el.month == 0;
        });
        drawYearlyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'monthly'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.section_id == key && el.year == $('#year-value').val() && el.direction_1 == roadDirection && el.month != 0;
        });
        drawMonthlyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'daily'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.section_id == key && el.direction_1 == roadDirection;
        });
        drawDailyGraph(currentFeatureData,key)
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'hourly'){
         currentFeatureData = filteredData.filter(function (el) {
          return el.section_id == key 
        });
        drawHourlyGraph(currentFeatureData[0],key);
      }
      else{
        currentFeatureData = filteredData.filter(function (el) {
          return el.section_id == key 
        });
        drawGraph(currentFeatureData[0],key)
      }
    }

    else if($('input[type="radio"][name="spatioradio"]:checked').val() == 'segment'){
      if($('input[type="radio"][name="optradio"]:checked').val()  == 'yearly'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.segment_id == key && el.direction_1 == roadDirection && el.month == 0;
        });
        drawYearlyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'monthly'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.segment_id == key && el.year == $('#year-value').val() && el.direction_1 == roadDirection && el.month != 0;
        });
        drawMonthlyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'daily'){
        currentFeatureData = allRoutesData.filter(function (el) {
          return el.segment_id == key && el.direction_1 == roadDirection;
        });
        drawDailyGraph(currentFeatureData,key);
      }
      else if($('input[type="radio"][name="optradio"]:checked').val()  == 'hourly'){
         currentFeatureData = filteredData.filter(function (el) {
          return el.segment_id == key 
        });
        drawHourlyGraph(currentFeatureData[0],key);
      }
      else{
        currentFeatureData = filteredData.filter(function (el) {
          return el.segment_id == key 
        });
        drawGraph(currentFeatureData[0],key);
      }
    }
        console.log(currentFeatureData);
        //Place check here,
        // drawGraph(currentFeatureData[0])
      }
    }

    function drawHourlyGraph(data,key){
      let chartData = [];
      for(let i = 1; i < 25; i++){
        console.log(i);
        columnNamesForHour =  timeline.filter(function (el) {
           return el.hour == i;
        }); 

        let ttiValueArray = [];
        let speedValueArray = [];
        let direction = "";
        let datadate;

        columnNamesForHour.forEach(column => {
          let ttiColumnValue = data[column.name];
          let speedColumnValue = data[column.speed];
          // direction = currentFeatureData[0]['direction_1'];
          // datadate = currentFeatureData[0]['timestamp'];
          ttiValueArray.push(parseFloat(ttiColumnValue));
          speedValueArray.push(parseFloat(speedColumnValue));
        });
        let sum = ttiValueArray.reduce((a, b) => a + b, 0);
        let avg = (sum / ttiValueArray.length) || 0;

        let speedSum = speedValueArray.reduce((a, b) => a + b, 0);
        let speedAvg = (speedSum / speedValueArray.length) || 0;

        chartData.push({
          // 'time': element['timestamp'],
          'time': i,
          'value': avg,
          'speed' : speedAvg        
        });
      }

      var chart = AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "theme": "light",
        "titles": [{
        "text": currentSelectedSpatial+' Id: ' + key + ' | Date: '+timestamp.substring(8,6)+'-'+timestamp.substring(6,4)+'-'+timestamp.substring(4,0) + ' | Hour: ' + selectedTime ,
        "size": 12
        }],
        "backgroundColor": "#DCDCDC",
        "dataProvider": chartData,
        "minMarginBottom": 60,
        "valueAxes": [{
          "id":"v1",
          "gridColor": "#FFFFFF",
          "axisColor": "#0066CC",
          "color": "#0066CC",
          "title": "Travel Time Index",
          "gridAlpha": 0.2,
          "dashLength": 0,
          "position": "left"
        },{
          "id":"v2",
          "gridColor": "#FFFFFF",
          "axisColor": "#db4c3c",
          "color": "#db4c3c",
          "title": "Speed (km/h)",
          "gridAlpha": 0.2,
          "dashLength": 0,
          "position": "right"
        }],
        "gridAboveGraphs": true,
        "startDuration": 1,
        "graphs": [{
          "title": "TTI",
          "fillAlphas": 1,
          "lineColor": "#B0C4DE",
          "fillColors": "#B0C4DE",
          "valueAxis": "v1",
          "balloonText": "[[title]]: <b>[[value]]</b>",
          //"bullet": "round",
          //"bulletSize": 2,
          "type": "column",
          "valueField": "value"
      },
      {
          "title": "Speed",
          "balloonText": "[[title]]: <b>[[value]]</b>",
          "valueAxis": "v2",
          "lineColor": "#db4c3c",
          "lineThickness": 2,
          //"bullet": "round",
          //"bulletSize": 2,
          "type": "smoothedLine",
          "valueField": "speed"
      }],
      "chartCursor": {
        "categoryBalloonEnabled": true,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "time",
      "categoryAxis": {
        "gridPosition": "start",
        //"labelFrequency": 0.8,
        //"labelOffset": 5,
        "gridAlpha": 0.1
      },
      "legend": {
        "position": "right",
        "spacing": 20,
      }
      });
    }

    function drawDailyGraph(data,key){
      console.log(data);
      // let labels = [];
      // let ttiValues = [];
      // let speedValues = [];
      let chartData = [];
      let dateLabels = [
        '1-06','2-06','3-06','4-06','5-06','6-06','7-06','8-06','9-06','10-06','11-06','12-06','13-06','14-06','15-06','16-06','17-06','18-06','19-06','20-06','21-06','22-06','23-06','24-06','25-06','26-06','27-06','28-06','29-06','30-06'
      ]
      let i = 0;
      data = data.slice(0, 30);
      data.forEach( element => {
        console.log(element['averageTTI']);

        // labels.push(element['timestamp']);
        // ttiValues.push(element['averageTTI']);
        // speedValues.push(element['v_avg']);

        chartData.push({
          // 'time': element['timestamp'],
          'time': dateLabels[i],
          'value': element['averageTTI'],
          'speed' : element['v_avg']
        });
        i++;
      });

      var chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "light",
  "titles": [{
        "text": currentSelectedSpatial+' Id: '+key+' | '+'Date: '+timestamp.substring(8,6)+'-'+timestamp.substring(6,4)+'-'+timestamp.substring(4,0),
        "size": 12
  }],
  "backgroundColor": "#DCDCDC",
  "dataProvider": chartData,
   "minMarginBottom": 60,
  "valueAxes": [{
    "id":"v1",
    "gridColor": "#FFFFFF",
    "axisColor": "#0066CC",
    "color": "#0066CC",
    "title": "Travel Time Index",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "left"
  },{
    "id":"v2",
    "gridColor": "#FFFFFF",
    "axisColor": "#db4c3c",
    "color": "#db4c3c",
    "title": "Speed (km/h)",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "right"
  }],
  "gridAboveGraphs": true,
  "startDuration": 1,
  "graphs": [{
    "title": "TTI",
    "fillAlphas": 1,
    "lineColor": "#B0C4DE",
    "fillColors": "#B0C4DE",
    "valueAxis": "v1",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "column",
    "valueField": "value"
},
{
    "title": "Speed",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    "valueAxis": "v2",
    "lineColor": "#db4c3c",
    "lineThickness": 2,
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "smoothedLine",
    "valueField": "speed"
}],
"chartCursor": {
  "categoryBalloonEnabled": true,
  "cursorAlpha": 0,
  "zoomable": false
},
"categoryField": "time",
"categoryAxis": {
  "gridPosition": "start",
  //"labelFrequency": 0.8,
  //"labelOffset": 5,
  "gridAlpha": 0.1
},
"legend": {
  "position": "right",
  "spacing": 20,
}
});
      // for( let i = 0; i < labels.length ; i++){
      //   chartData.push({
      //     'time': labels[i],
      //     'value': element['averageTTI'],
      //     'speed' : element['v_avg']
      //   })
      // }
    }

    function drawGraph(data,key){

      console.log(data);
      let labels = Object.keys(data);
      labels = labels.slice(2, 98);
// console.log(labels);
labels = labels.map(function (x) { 
  let slice = x.slice(3, 7);
  slice = slice.replace(/(..)/g, '$1:').slice(0,-1)
  return slice; 
});

let values  = Object.values(data);
let ttivalues = values.slice(2, 98);
let speedValues = values.slice(100, 196);

// if($('input[type="radio"][name="optradio"]:checked').val() == '15min'){
//   ttivalues = values.slice(2, 98);
//   speedValues = values.slice(104, 200);
// }
// if($('input[type="radio"][name="optradio"]:checked').val() == 'daily'){
//   ttivalues = values[];
//   speedValues = values[];
// }
// console.log(values);
var intValues = ttivalues.map(function (x) { 
  return parseFloat(x); 
});
var intSpeedValues = speedValues.map(function (x) { 
  return parseInt(x); 
});
// console.log(intValues);
let chartData = []

for( let i = 0; i < labels.length ; i++){
  chartData.push({
    'time': labels[i],
    'value': intValues[i],
    'speed' : intSpeedValues[i]
  })
}

var chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "light",
  "titles": [{
    "text": currentSelectedSpatial+' Id: ' + key + ' Date: ' +timestamp.substring(8,6)+'-'+timestamp.substring(6,4)+'-'+timestamp.substring(4,0) + ' Time: ' + selectedTime ,
    "size": 12
  }],
  "backgroundColor": "#DCDCDC",
  "dataProvider": chartData,
  "minMarginBottom": 60,
  "valueAxes": [{
    "id":"v1",
    "gridColor": "#FFFFFF",
    "axisColor": "#0066CC",
    "color": "#0066CC",
    "title": "Travel Time Index",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "left"
  },{
    "id":"v2",
    "gridColor": "#FFFFFF",
    "axisColor": "#db4c3c",
    "color": "#db4c3c",
    "title": "Speed (km/h)",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "right"
  }],
  "gridAboveGraphs": true,
  "startDuration": 1,
  "graphs": [{
    "title": "TTI",
    "fillAlphas": 1,
    "lineColor": "#B0C4DE",
    "fillColors": "#B0C4DE",
    "valueAxis": "v1",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "column",
    "valueField": "value"
},
{
    "title": "Speed",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    "valueAxis": "v2",
    "lineColor": "#db4c3c",
    "lineThickness": 2,
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "smoothedLine",
    "valueField": "speed"
}],
"chartCursor": {
  "categoryBalloonEnabled": true,
  "cursorAlpha": 0,
  "zoomable": false
},
"categoryField": "time",
"categoryAxis": {
  "gridPosition": "start",
  //"labelFrequency": 0.8,
  //"labelOffset": 5,
  "gridAlpha": 0.1
},
"legend": {
  "position": "right",
  "spacing": 20,
}
});
}

    function drawYearlyGraph(data,key){
      console.log(data);
      // let labels = [];
      // let ttiValues = [];
      // let speedValues = [];
      let chartData = [];
      let dateLabels = [
        2017,2018,2019
      ]
      let i = 0;
      data.forEach( element => {
        console.log(element['TTI']);

        // labels.push(element['timestamp']);
        // ttiValues.push(element['averageTTI']);
        // speedValues.push(element['v_avg']);

        chartData.push({
          // 'time': element['timestamp'],
          'time': dateLabels[i],
          'value': element['TTI'],
          'speed' : element['v']
        });
        i++;
      });
      var chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "light",
  "titles": [{
    "text": currentSelectedSpatial+' Id: ' + key + ' | Year: ' + data[1].year,
    "size": 12
  }],
  "backgroundColor": "#DCDCDC",
  "dataProvider": chartData,
  "minMarginBottom": 60,
  "valueAxes": [{
    "id":"v1",
    "gridColor": "#FFFFFF",
    "axisColor": "#0066CC",
    "color": "#0066CC",
    "title": "Travel Time Index",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "left"
  },{
    "id":"v2",
    "gridColor": "#FFFFFF",
    "axisColor": "#db4c3c",
    "color": "#db4c3c",
    "title": "Speed (km/h)",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "right"
  }],
  "gridAboveGraphs": true,
  "startDuration": 1,
  "graphs": [{
    "title": "TTI",
    "fillAlphas": 1,
    "lineColor": "#B0C4DE",
    "fillColors": "#B0C4DE",
    "valueAxis": "v1",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "column",
    "valueField": "value"
},
{
    "title": "Speed",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    "valueAxis": "v2",
    "lineColor": "#db4c3c",
    "lineThickness": 2,
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "smoothedLine",
    "valueField": "speed"
}],
"chartCursor": {
  "categoryBalloonEnabled": true,
  "cursorAlpha": 0,
  "zoomable": false
},
"categoryField": "time",
"categoryAxis": {
  "gridPosition": "start",
  //"labelFrequency": 0.8,
  //"labelOffset": 5,
  "gridAlpha": 0.1
},
"legend": {
  "position": "right",
  "spacing": 20,
}
});
    }

       function drawMonthlyGraph(data,key){
      console.log(data);
      // let labels = [];
      // let ttiValues = [];
      // let speedValues = [];
      let chartData = [];
      let dateLabels = [];

      if (data[0].year == 2017) {
      	dateLabels = ['Oct','Nov','Dec']
      }
      else{
      	dateLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      }

      let i = 0;
      data.forEach( element => {
        console.log(element['TTI']);

        // labels.push(element['timestamp']);
        // ttiValues.push(element['averageTTI']);
        // speedValues.push(element['v_avg']);

        chartData.push({
          // 'time': element['timestamp'],
          'time': dateLabels[i],
          'value': element['TTI'],
          'speed' : element['v']
        });
        i++;
      });
       let y =  $('#year-value').val();
      let m = $('#month-value').val();
      var chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "light",
  "titles": [{
    "text": currentSelectedSpatial+' Id: ' + key + ' | Year: ' +data[1].year+' | Month: '+m,
    "size": 12
  }],
  "backgroundColor": "#DCDCDC",
  "dataProvider": chartData,
  "minMarginBottom": 60,
  "valueAxes": [{
    "id":"v1",
    "gridColor": "#FFFFFF",
    "axisColor": "#0066CC",
    "color": "#0066CC",
    "title": "Travel Time Index",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "left"
  },{
    "id":"v2",
    "gridColor": "#FFFFFF",
    "axisColor": "#db4c3c",
    "color": "#db4c3c",
    "title": "Speed (km/h)",
    "gridAlpha": 0.2,
    "dashLength": 0,
    "position": "right"
  }],
  "gridAboveGraphs": true,
  "startDuration": 1,
  "graphs": [{
    "title": "TTI",
    "fillAlphas": 1,
    "lineColor": "#B0C4DE",
    "fillColors": "#B0C4DE",
    "valueAxis": "v1",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "column",
    "valueField": "value"
},
{
    "title": "Speed",
    "balloonText": "[[title]]: <b>[[value]]</b>",
    "valueAxis": "v2",
    "lineColor": "#db4c3c",
    "lineThickness": 2,
    //"bullet": "round",
    //"bulletSize": 2,
    "type": "smoothedLine",
    "valueField": "speed"
}],
"chartCursor": {
  "categoryBalloonEnabled": true,
  "cursorAlpha": 0,
  "zoomable": false
},
"categoryField": "time",
"categoryAxis": {
  "gridPosition": "start",
  //"labelFrequency": 0.8,
  //"labelOffset": 5,
  "gridAlpha": 0.1
},
"legend": {
  "position": "right",
  "spacing": 20,
}
});
    }

function closeGraph(){
  $('.graph-panel').hide();
}

function hideAllLegends(){
  $('.legend-1').hide();
  $('.legend-2').hide();
  $('.legend-3').hide();
  $('.legend-4').hide();
  $('.legend-5').hide();
  $('.legend-6').hide();
  $('.legend-7').hide();
  $('.legend-8').hide();
  $('.legend-9').hide();
  $('.legend-10').hide();
}

function legend1(){
  hideAllLegends();
  $('.legend-1').show();
}

function legend2(){
  hideAllLegends();
  $('.legend-2').show();
}

function legend3(){
  hideAllLegends();
  $('.legend-3').show();
}

function legend4(){
  hideAllLegends();
  $('.legend-4').show();
}

function legend5(){
  hideAllLegends();
  $('.legend-5').show();
}

function legend6(){
  hideAllLegends();
  $('.legend-6').show();
}

function legend7(){
  hideAllLegends();
  $('.legend-7').show();
}

function legend8(){
  hideAllLegends();
  $('.legend-8').show();
}

function legend9(){
  hideAllLegends();
  $('.legend-9').show();
}

function legend10(){
  hideAllLegends();
  $('.legend-10').show();
}


