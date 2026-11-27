"use client";

import { useEffect, useRef, useState } from "react";
import type { AboutClinic } from "@/config/about";

const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_";

/**
 * A clinic's map (Leaflet with Esri light grey tiles): the clinic photo pops up on its pin when the map
 * comes into view, with numbered parking pins around it. The map library is loaded only here, in the browser.
 */
export function ClinicMap({ clinic: c, height }: { clinic: AboutClinic; height: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let gone = false;
    let cleanup = () => {};
    void import("leaflet").then(({ default: L }) => {
      if (gone) return;
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const map = L.map(el, { scrollWheelZoom: false, dragging: !touch, zoomControl: false, attributionControl: true, minZoom: 12, maxZoom: 16 });
      if (!touch) L.control.zoom({ position: "bottomright" }).addTo(map);
      map.attributionControl.setPrefix(false);
      L.tileLayer(`${ESRI}Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, attribution: "Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors" }).addTo(map);
      L.tileLayer(`${ESRI}Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16 }).addTo(map);
      const pin = L.divIcon({
        className: "map-clinic",
        iconSize: [160, 190],
        iconAnchor: [80, 190],
        html: `<div class="map-card"><span class="map-photo"><img src="${c.img}" alt=""></span><span class="map-name">${escapeHtml(c.name)} clinic</span></div><i class="map-stem"></i><i class="map-dot"></i>`,
      });
      L.marker(c.position, { icon: pin, title: `NewDermaMed ${c.name} clinic`, zIndexOffset: 1000, keyboard: false }).addTo(map);
      for (const p of c.parking) {
        const icon = L.divIcon({ className: "map-park", iconSize: [30, 30], iconAnchor: [15, 15], html: "<span>P</span>" });
        const info = `<strong>${escapeHtml(p.name)}</strong><br>${escapeHtml(p.address)}`;
        L.marker(p.position, { icon, title: `Parking: ${p.name}`, keyboard: false, zIndexOffset: 2000 })
          .addTo(map)
          .bindTooltip(info, { direction: "top", offset: [0, -16], className: "map-tip" })
          .bindPopup(`${info}<br><a href="${p.map}" target="_blank" rel="noopener">Directions</a>`, { offset: [0, -14] });
      }
      map.fitBounds(L.latLngBounds([c.position, ...c.parking.map((p) => p.position)]), { paddingTopLeft: [40, 200], paddingBottomRight: [40, 50], maxZoom: 16 });
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setOn(true);
            io.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
      cleanup = () => {
        io.disconnect();
        map.remove();
      };
    });
    return () => {
      gone = true;
      cleanup();
    };
  }, [c]);
  return (
    <div className={`clinic-map relative isolate overflow-hidden rounded-[22px] ring-1 ring-ndm-ink/[.08] ${on ? "is-on" : ""}`}>
      <div ref={box} role="img" aria-label={`Map of the ${c.name} clinic at ${c.address.join(", ")} and ${c.parking.length} nearby parking lots`} className={`${height} w-full bg-[#F2F2EF]`} />
      <div className="pointer-events-none absolute bottom-7 left-3 z-[500] flex flex-wrap gap-2 sm:bottom-8 sm:left-4">
        <span className="map-legend">
          <i className="map-legend-dot" />
          Clinic
        </span>
        <span className="map-legend">
          <i className="map-legend-p">P</i>
          <span>
            Parking<span className="map-hint-hover">, hover for address</span>
            <span className="map-hint-tap">, tap for address</span>
          </span>
        </span>
      </div>
    </div>
  );
}
