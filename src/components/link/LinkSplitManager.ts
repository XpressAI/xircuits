// src/components/link/LinkSplitManager.ts

import { DiagramModel, DefaultLinkModel } from '@projectstorm/react-diagrams';
import { CustomPortModel } from '../port/CustomPortModel';

export class LinkSplitManager {
    private static hoveredLinkId: string | null = null;

    static getHoveredLinkId(): string | null {
        return this.hoveredLinkId;
    }
    
    /**
     * Detects if the pointer is currently hovering over a link.
     * Returns the linkId if found, or null otherwise.
     */
    static detectLinkUnderPointer(clientX: number, clientY: number): string | null {
        const els = document.elementsFromPoint(clientX, clientY) as HTMLElement[];
        const gEl = els.find(el => el.dataset && el.dataset.linkid);
        return gEl?.dataset?.linkid ?? null;
    }

    
    static canSplit(link: DefaultLinkModel): boolean {
        const src = link.getSourcePort() as CustomPortModel;
        const dst = link.getTargetPort() as CustomPortModel;
        return src.getName() === 'out-0' && dst.getName() === 'in-0';
    }

    /**
     * Highlights a link on hover, only if canSplit returns true.
     * @param linkId ID of the link under the pointer
     * @param model  The DiagramModel instance (engine.getModel())
     */
    static setHover(linkId: string | null, model: DiagramModel): void {
    if (linkId === this.hoveredLinkId) return;
    this.clearHover();

    if (linkId) {
        const link = model.getLink(linkId) as DefaultLinkModel;
        if (link && this.canSplit(link)) {
        const g = document.querySelector(`g[data-linkid="${linkId}"]`) as SVGGElement | null;
        g?.classList.add('hover');
        this.hoveredLinkId = linkId;
        return;
        }
    }
    this.hoveredLinkId = null;
    }


    static clearHover(): void {
        if (!this.hoveredLinkId) return;

        const g = document.querySelector(
        `g[data-linkid="${this.hoveredLinkId}"]`
        ) as SVGGElement | null;
        g?.classList.remove('hover');
        this.hoveredLinkId = null;
    }
    }
