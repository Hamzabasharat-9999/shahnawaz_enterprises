import { COMPANY_PROFILE } from '../config/companyProfile';
export const COMPANY = { name: COMPANY_PROFILE.name, tagline: COMPANY_PROFILE.tagline, services: COMPANY_PROFILE.services.map(service => typeof service === 'string' ? service : service.title) };
export { COMPANY_PROFILE };
export const NAVIGATION=[{label:'Home',path:'/'},{label:'Products',path:'/products'},{label:'Portfolio',path:'/portfolio'},{label:'Calculator',path:'/calculator'},{label:'Appointments',path:'/appointments'},{label:'Reviews',path:'/reviews'}];
export const API_BASE_URL=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
