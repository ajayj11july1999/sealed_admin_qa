import { Injectable } from '@angular/core';

export interface BadgeItem {
    type: string;
    value: string;
}
export interface Saperator {
    name: string;
    type?: string;
}
export interface ChildrenItems {
    state: string;
    name: string;
    type?: string;
}

export interface Menu {
    state: string;
    name: string;
    type: string;
    icon: string;
    badge?: BadgeItem[];
    saperator?: Saperator[];
    children?: ChildrenItems[];
}

const MENUITEMS = [
    {
        state: 'starter',
        name: 'Campaign Master',
        type: 'link',
        icon: 'content_copy'
    },
    {
        state: 'starter',
        name: 'Draw List',
        type: 'link',
        icon: 'content_copy'
    },
    {
        state: 'starter',
        name: 'Winner List',
        type: 'link',
        icon: 'content_copy'
    },
    
    
];

@Injectable()
export class HorizontalMenuItems {
    getMenuitem(): Menu[] {
        return MENUITEMS;
    }
}
