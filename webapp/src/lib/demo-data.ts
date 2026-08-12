export type Severity = 'critical' | 'urgent' | 'normal';

export type Emergency = {
  id: string; request_code: string; location_name: string; emergency_type: string;
  urgency: Severity; people_affected: number; status: string; eta_minutes: number | null;
  assigned_volunteer_id: string | null; created_at: string; description?: string;
};

export type Prediction = { id: string; disaster_type: string; location_name: string; probability: number; risk_level: string; affected_population: number; affected_areas: number; expected_window: string; factors: {label:string;detail:string}[]; recommendations: {priority:number;text:string}[] };

export type Volunteer = { id: string; full_name: string; skills: string[]; availability: string; current_lat: number | null; current_lng: number | null };

export const demoEmergencies: Emergency[] = [
  { id:'1', request_code:'RF-7K29X4P1', location_name:'Riverside District', emergency_type:'Medical Assistance', urgency:'critical', people_affected:4, status:'on_the_way', eta_minutes:12, assigned_volunteer_id:'v1', created_at:new Date(Date.now()-8*60000).toISOString(), description:'Water rising fast near the building, one elderly person needs medical attention.' },
  { id:'2', request_code:'RF-3M81QZXA', location_name:'Sector B', emergency_type:'Water Level Rise', urgency:'urgent', people_affected:11, status:'verified', eta_minutes:null, assigned_volunteer_id:null, created_at:new Date(Date.now()-22*60000).toISOString() },
  { id:'3', request_code:'RF-9J44LWYT', location_name:'Route H-4', emergency_type:'Supply Route Blocked', urgency:'urgent', people_affected:0, status:'submitted', eta_minutes:null, assigned_volunteer_id:null, created_at:new Date(Date.now()-60*60000).toISOString() },
  { id:'4', request_code:'RF-5D62NPKX', location_name:'Riverside District', emergency_type:'Rescue Operation', urgency:'critical', people_affected:6, status:'assigned', eta_minutes:18, assigned_volunteer_id:'v2', created_at:new Date(Date.now()-14*60000).toISOString() },
  { id:'5', request_code:'RF-2B77VTHQ', location_name:'Sector C', emergency_type:'Medical Evac Required', urgency:'critical', people_affected:1, status:'submitted', eta_minutes:null, assigned_volunteer_id:null, created_at:new Date(Date.now()-3*60000).toISOString() },
  { id:'6', request_code:'RF-8H15WCRE', location_name:'North Hills', emergency_type:'Landslide Response', urgency:'urgent', people_affected:5, status:'verified', eta_minutes:null, assigned_volunteer_id:null, created_at:new Date(Date.now()-40*60000).toISOString() },
];

export const demoVolunteers: Volunteer[] = [
  {id:'v1',full_name:'Alex Morgan',skills:['Medical','Rescue'],availability:'on_mission',current_lat:19.081,current_lng:72.882},
  {id:'v2',full_name:'Priya Nair',skills:['Water','Shelter'],availability:'available',current_lat:19.071,current_lng:72.865},
  {id:'v3',full_name:'Jordan Lee',skills:['Rescue','Logistics'],availability:'available',current_lat:19.09,current_lng:72.9},
  {id:'v4',full_name:'Samira Khan',skills:['Medical'],availability:'available',current_lat:19.065,current_lng:72.89},
];

export const demoPrediction: Prediction = {id:'p1',disaster_type:'Flood',location_name:'Riverside District',probability:82,risk_level:'high',affected_population:3842,affected_areas:14,expected_window:'24–48 hours',factors:[{label:'Heavy rainfall',detail:'+38% above normal'},{label:'River level',detail:'Rising rapidly'},{label:'Historical patterns',detail:'Similar conditions caused flooding'},{label:'Ground saturation',detail:'High'}],recommendations:[{priority:1,text:'Prepare evacuation support in Riverside District.'},{priority:2,text:'Move emergency supplies closer to predicted zone.'},{priority:3,text:'Alert volunteers in nearby regions.'}]};

export const statusLabel: Record<string,string> = {submitted:'Pending review',verified:'Verified',assigned:'Responder assigned',on_the_way:'On the way',arrived:'Arrived',assisting:'Assisting',resolved:'Resolved'};

export function timeAgo(value:string){const min=Math.max(1,Math.floor((Date.now()-new Date(value).getTime())/60000));return min<60?`${min} min ago`:`${Math.floor(min/60)} hr ago`}
