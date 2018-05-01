
export interface Quest {
    id_member_mission: number;
    id_mission: number;
    duration: number | null;
    cost: number;
    remaining_time: number;
    remaining_cost?: number;
}
