import {apiClient} from "@/lib/api/client";
export type TicketStatus="open"|"pending"|"resolved"|"closed";
export type SupportTicket={id:string;ticketNumber:number;userId:string;email:string;fullName:string;orderNumber:number|null;subject:string;category:string;priority:"low"|"medium"|"high";status:TicketStatus;customerUnread:boolean;staffUnread:boolean;createdAt:string;updatedAt:string};
export type SupportMessage={id:string;senderId:string;sender:"user"|"support";message:string;date:string};
export type TicketDetail={ticket:SupportTicket;messages:SupportMessage[]};
export type TicketFilters={search?:string;status?:string;limit?:number;offset?:number};
export async function listTickets(admin=false,filters:TicketFilters={}){const {data}=await apiClient.get<{tickets:SupportTicket[];limit:number;offset:number}>(admin?"/api/v1/admin/support/tickets":"/api/v1/support/tickets",{params:filters});return data;}
export async function createTicket(payload:{subject:string;category:string;priority:string;message:string;orderNumber?:number}){const {data}=await apiClient.post<{id:string;ticketNumber:number}>("/api/v1/support/tickets",payload);return data;}
export async function getTicket(id:string,admin=false){const {data}=await apiClient.get<TicketDetail>((admin?"/api/v1/admin/support/tickets/":"/api/v1/support/tickets/")+encodeURIComponent(id));return data;}
export async function replyTicket(id:string,message:string,admin=false){await apiClient.post((admin?"/api/v1/admin/support/tickets/":"/api/v1/support/tickets/")+encodeURIComponent(id)+"/messages",{message});}
export async function changeTicketStatus(id:string,status:TicketStatus,admin=false){await apiClient.patch((admin?"/api/v1/admin/support/tickets/":"/api/v1/support/tickets/")+encodeURIComponent(id)+"/status",{status});}
