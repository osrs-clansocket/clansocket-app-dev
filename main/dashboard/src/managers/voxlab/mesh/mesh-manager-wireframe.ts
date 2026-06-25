import { type Group, LineBasicMaterial, LineSegments, type Mesh, WireframeGeometry } from "three";
import { disposeMaterial } from "./mesh-manager-material.js";

export class WireframeState {
    private current: LineSegments | null = null;
    color = "#f5ca7a";
    opacity = 0.35;

    show(group: Group, mesh: Mesh | null): void {
        if (!mesh || this.current) return;
        const material = new LineBasicMaterial({ color: this.color, opacity: this.opacity, transparent: true });
        const wireframe = new LineSegments(new WireframeGeometry(mesh.geometry), material);
        group.add(wireframe);
        this.current = wireframe;
    }

    hide(group: Group): void {
        if (!this.current) return;
        // eslint-disable-next-line lvi/no-raw-dom -- three.js Group.remove, not DOM
        group.remove(this.current);
        this.current.geometry.dispose();
        disposeMaterial(this.current.material);
        this.current = null;
    }

    setColor(color: string): void {
        this.color = color;
        if (this.current) (this.current.material as LineBasicMaterial).color.set(color);
    }

    setOpacity(opacity: number): void {
        const safe = Number.isFinite(opacity) ? Math.max(0, Math.min(1, opacity)) : 1;
        this.opacity = safe;
        if (this.current) (this.current.material as LineBasicMaterial).opacity = safe;
    }
}
