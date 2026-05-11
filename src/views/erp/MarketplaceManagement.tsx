"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Pencil, Trash2, Info, Loader2, AlertTriangle,
  ChevronLeft, ChevronRight, Camera, ImagePlus, X, Search, CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { compressImage, parsePhotoUrls } from '@/lib/imageUtils';
import { TrustScorePanel } from '@/components/marketplace/TrustScore';
import type { MarketplaceTrustScore } from '@/lib/marketplace-trust';

interface CattleRef {
  id: string;
  cattle_code: string;
  breed: string;
  current_weight: number;
  status: string;
}

interface Listing {
  id: string;
  asking_price: number;
  photo_url: string | null;
  description: string | null;
  status: string;
  listed_at: string;
  cattle: { cattle_code: string; breed: string; teeth: number; current_weight: number; gender: string; coat_color: string | null } | null;
  station_id: string;
  stations: { station_name: string; station_tag: string } | null;
}

interface LocalPhoto {
  id: string;
  file: File;
  preview: string;
}

// ── Image Carousel ──────────────────────────────────────────────────────────
const ImageCarousel = ({ urls }: { urls: string[] }) => {
  const [idx, setIdx] = useState(0);
  if (urls.length === 0) {
    return (
      <div className="h-48 bg-gradient-to-br from-sw-green-50 to-sw-green-100/50 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Camera className="h-8 w-8 text-sw-green-300" />
        <span className="text-xs font-medium">No photo</span>
      </div>
    );
  }
  if (urls.length === 1) {
    return (
      <div className="h-48 overflow-hidden bg-[#050f05]/5 flex items-center justify-center">
        <img src={urls[0]} alt="listing" loading="lazy" className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" />
      </div>
    );
  }
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + urls.length) % urls.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % urls.length); };
  return (
    <div className="relative h-48 bg-[#050f05]/5 group overflow-hidden flex items-center justify-center">
      <img src={urls[idx]} alt={`photo ${idx + 1}`} loading="lazy" className="w-full h-full object-contain transition-all duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md">
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {urls.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
        ))}
      </div>
      <span className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
        {idx + 1}/{urls.length}
      </span>
    </div>
  );
};

// ── Photo Picker (create modal) ─────────────────────────────────────────────
const PhotoPicker = ({
  photos,
  onChange,
}: {
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
}) => {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 3 - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const newPhotos: LocalPhoto[] = [];
    for (const f of toProcess) {
      try {
        const compressed = await compressImage(f);
        const preview = URL.createObjectURL(compressed);
        newPhotos.push({ id: `${Date.now()}-${Math.random()}`, file: compressed, preview });
      } catch {
        toast({ title: 'Error', description: `Failed to process ${f.name}`, variant: 'destructive' });
      }
    }
    onChange([...photos, ...newPhotos]);
  };

  const remove = (id: string) => {
    const p = photos.find(x => x.id === id);
    if (p) URL.revokeObjectURL(p.preview);
    onChange(photos.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Photos (up to 3)</label>
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map(p => (
            <div key={p.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src={p.preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length < 3 && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs h-8"
            onClick={() => galleryRef.current?.click()}>
            <ImagePlus className="h-3.5 w-3.5" />Upload
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs h-8"
            onClick={() => cameraRef.current?.click()}>
            <Camera className="h-3.5 w-3.5" />Camera
          </Button>
          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => handleFiles(e.target.files)} />
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">JPEG, PNG or WebP · max 5 MB each · auto-compressed</p>
    </div>
  );
};

// ── Edit Photo Picker ───────────────────────────────────────────────────────
const EditPhotoPicker = ({
  existingUrls,
  newPhotos,
  onExistingChange,
  onNewChange,
}: {
  existingUrls: string[];
  newPhotos: LocalPhoto[];
  onExistingChange: (urls: string[]) => void;
  onNewChange: (photos: LocalPhoto[]) => void;
}) => {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const total = existingUrls.length + newPhotos.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 3 - total;
    const toProcess = Array.from(files).slice(0, remaining);
    const added: LocalPhoto[] = [];
    for (const f of toProcess) {
      try {
        const compressed = await compressImage(f);
        const preview = URL.createObjectURL(compressed);
        added.push({ id: `${Date.now()}-${Math.random()}`, file: compressed, preview });
      } catch {
        toast({ title: 'Error', description: `Failed to process ${f.name}`, variant: 'destructive' });
      }
    }
    onNewChange([...newPhotos, ...added]);
  };

  const removeExisting = (url: string) => onExistingChange(existingUrls.filter(u => u !== url));
  const removeNew = (id: string) => {
    const p = newPhotos.find(x => x.id === id);
    if (p) URL.revokeObjectURL(p.preview);
    onNewChange(newPhotos.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Photos (up to 3)</label>
      {total > 0 && (
        <div className="flex gap-2 flex-wrap">
          {existingUrls.map(url => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src={url} alt="existing" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeExisting(url)}
                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {newPhotos.map(p => (
            <div key={p.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/50">
              <img src={p.preview} alt="new" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeNew(p.id)}
                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-0.5 left-0.5 bg-primary text-primary-foreground text-[8px] px-1 rounded">new</span>
            </div>
          ))}
        </div>
      )}
      {total < 3 && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs h-8"
            onClick={() => galleryRef.current?.click()}>
            <ImagePlus className="h-3.5 w-3.5" />Upload
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs h-8"
            onClick={() => cameraRef.current?.click()}>
            <Camera className="h-3.5 w-3.5" />Camera
          </Button>
          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => handleFiles(e.target.files)} />
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">JPEG, PNG or WebP · max 5 MB each · auto-compressed</p>
    </div>
  );
};

// ── Upload helper ───────────────────────────────────────────────────────────
async function uploadPhotos(photos: LocalPhoto[], token: string): Promise<string[]> {
  const urls: string[] = [];
  for (const p of photos) {
    const fd = new FormData();
    fd.append('file', p.file);
    const res = await fetch('/api/erp/marketplace/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Upload failed'); }
    const { url } = await res.json();
    urls.push(url);
  }
  return urls;
}

// ── Main Component ──────────────────────────────────────────────────────────
const MarketplaceManagement = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const canEdit = ['Admin', 'Manager'].includes(role);
  const isAdmin = role === 'Admin';

  const [listings, setListings] = useState<Listing[]>([]);
  const [cattle, setCattle] = useState<CattleRef[]>([]);
  const [trustScore, setTrustScore] = useState<MarketplaceTrustScore | null>(null);
  const [loading, setLoading] = useState(true);

  const [trustOpen, setTrustOpen] = useState(false);

  const [stationFilter, setStationFilter] = useState(currentStation?.id ?? 'All');

  useEffect(() => {
    if (currentStation?.id) setStationFilter(currentStation.id);
  }, [currentStation?.id]);

  // Farm phone (default WhatsApp)
  const [farmPhone, setFarmPhone] = useState('');

  // Animal picker (create)
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerStatus, setPickerStatus] = useState('');

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ cattleId: '', askingPrice: '', description: '', whatsapp: '' });
  const [createPhotos, setCreatePhotos] = useState<LocalPhoto[]>([]);
  const [createSaving, setCreateSaving] = useState(false);

  // Edit state
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editExistingUrls, setEditExistingUrls] = useState<string[]>([]);
  const [editNewPhotos, setEditNewPhotos] = useState<LocalPhoto[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Remove state
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removeSaving, setRemoveSaving] = useState(false);

  // Mark as Sold state
  const [markSoldId, setMarkSoldId] = useState<string | null>(null);
  const [markSoldSaving, setMarkSoldSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [lr, cr, fr] = await Promise.all([
        fetch('/api/erp/marketplace', { headers }),
        fetch('/api/erp/cattle', { headers }),
        fetch('/api/erp/settings/farm', { headers }),
      ]);
      const [ld, cd, fd] = await Promise.all([lr.json(), cr.json(), fr.json()]);
      setListings(ld.listings ?? []);
      setTrustScore(ld.trust_score ?? null);
      setCattle(cd.cattle ?? []);
      if (fd.farm?.phone) setFarmPhone(fd.farm.phone);
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const readyAnimals = useMemo(() => cattle.filter(c => !['sold', 'slaughtered', 'dead', 'listed'].includes(c.status)), [cattle]);
  const activeListings = useMemo(() => listings.filter(l => l.status === 'active'), [listings]);

  const stationOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { id: string; label: string }[] = [];
    activeListings.forEach(l => {
      if (l.station_id && !seen.has(l.station_id)) {
        seen.add(l.station_id);
        opts.push({ id: l.station_id, label: l.stations?.station_name ?? l.station_id });
      }
    });
    return opts;
  }, [activeListings]);

  const filteredListings = useMemo(() => {
    return activeListings.filter(l => stationFilter === 'All' || l.station_id === stationFilter);
  }, [activeListings, stationFilter]);

  const resetCreate = () => {
    createPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    setCreatePhotos([]);
    setCreateForm({ cattleId: '', askingPrice: '', description: '', whatsapp: farmPhone });
    setPickerOpen(false); setPickerSearch(''); setPickerStatus('');
  };

  const handleCreate = async () => {
    if (!createForm.cattleId || !createForm.askingPrice) {
      toast({ title: 'Error', description: 'Select an animal and set asking price', variant: 'destructive' }); return;
    }
    setCreateSaving(true);
    try {
      let photoUrls: string[] = [];
      if (createPhotos.length > 0) {
        photoUrls = await uploadPhotos(createPhotos, token);
      }
      // Encode WhatsApp number in description as [wa:NUMBER] prefix
      const waTag = createForm.whatsapp ? `[wa:${createForm.whatsapp.replace(/\s/g, '')}]` : '';
      const fullDescription = waTag
        ? (createForm.description ? `${waTag} ${createForm.description}` : waTag)
        : (createForm.description || null);

      const res = await fetch('/api/erp/marketplace', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cattleId: createForm.cattleId,
          askingPrice: Number(createForm.askingPrice),
          description: fullDescription,
          photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Listing Published', description: 'Animal is now visible on the public marketplace.' });
      setCreateOpen(false);
      resetCreate();
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setCreateSaving(false); }
  };

  const openEdit = (l: Listing) => {
    setEditListing(l);
    setEditPrice(String(l.asking_price));
    setEditDesc(l.description ?? '');
    setEditExistingUrls(parsePhotoUrls(l.photo_url));
    setEditNewPhotos([]);
  };

  const resetEdit = () => {
    editNewPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    setEditNewPhotos([]);
    setEditListing(null);
  };

  const handleEdit = async () => {
    if (!editListing) return;
    setEditSaving(true);
    try {
      let uploadedUrls: string[] = [];
      if (editNewPhotos.length > 0) {
        uploadedUrls = await uploadPhotos(editNewPhotos, token);
      }
      const finalUrls = [...editExistingUrls, ...uploadedUrls];

      const res = await fetch(`/api/erp/marketplace/${editListing.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          askingPrice: Number(editPrice),
          description: editDesc || null,
          photoUrls: finalUrls,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const { listing: updated } = await res.json();
      setListings(prev => prev.map(l => l.id === editListing.id ? { ...l, ...updated } : l));
      toast({ title: 'Listing updated' });
      resetEdit();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setEditSaving(false); }
  };

  const handleRemove = async () => {
    if (!removeId) return;
    setRemoveSaving(true);
    try {
      const res = await fetch(`/api/erp/marketplace/${removeId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove' }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Listing removed', description: 'Animal status moved to Active.' });
      setRemoveId(null);
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setRemoveSaving(false); }
  };

  const handleMarkSold = async () => {
    if (!markSoldId) return;
    setMarkSoldSaving(true);
    try {
      const res = await fetch(`/api/erp/marketplace/${markSoldId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-sold' }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Marked as Sold', description: 'Listing closed and animal status updated to Sold.' });
      setMarkSoldId(null);
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setMarkSoldSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground erp-slide-up">Marketplace Management</h1>
        <div className="flex gap-2">
          {isAdmin && stationOptions.length > 1 && (
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Station" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Stations</SelectItem>
                {stationOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {canEdit && (
            <Button onClick={() => { setCreateForm({ cattleId: '', askingPrice: '', description: '', whatsapp: farmPhone }); setPickerOpen(false); setPickerSearch(''); setPickerStatus(''); setCreatePhotos([]); setCreateOpen(true); }} className="gap-1.5 h-9 shadow-sm">
              <Plus className="h-4 w-4" /> Create Listing
            </Button>
          )}
          <Button variant="outline" onClick={() => setTrustOpen(true)} className="gap-1.5 h-9 bg-white hover:bg-sw-green-50 text-sw-green-700 border-sw-green-200 shadow-sm">
            <Info className="h-4 w-4" /> View Trust Score
          </Button>
        </div>
      </div>

      <Card className="border-sw-gold-400/30 bg-sw-gold-400/5 erp-glass-card-subtle erp-stagger-1">
        <CardContent className="p-3 flex gap-2 items-start text-xs">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-gold-400" />
          <span className="text-foreground/70">
            Platform charges a one-time listing fee + monthly subscription per active animal. WhatsApp contact is saved per listing so buyers can reach you directly.
          </span>
        </CardContent>
      </Card>

      {/* ── Listings Grid ── */}
      {filteredListings.length === 0 ? (
        <Card className="erp-glass-card-subtle">
          <CardContent className="py-20 text-center">
            <Camera className="h-12 w-12 text-sw-green-200 mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-1">No active listings</p>
            <p className="text-sm text-muted-foreground">{canEdit ? 'Create one to get started.' : 'Contact Admin to create listings.'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((l, i) => {
            const photoUrls = parsePhotoUrls(l.photo_url);
            return (
              <Card key={l.id} className={`overflow-hidden erp-glass-card group erp-stagger-${Math.min(i + 1, 7)}`}>
                <ImageCarousel urls={photoUrls} />
                <CardContent className="p-5 space-y-3">
                  {/* Breed + Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{l.cattle?.breed ?? '—'}</span>
                    <StatusBadge status="listed" />
                  </div>

                  {/* Price */}
                  <p className="text-xl font-bold text-primary">PKR {l.asking_price.toLocaleString()}</p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs py-2 border-y border-border/50">
                    <div>
                      <span className="text-muted-foreground">Code</span>
                      <p className="font-mono font-semibold text-foreground">{l.cattle?.cattle_code}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight</span>
                      <p className="font-semibold text-foreground">{l.cattle?.current_weight} kg</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teeth / Gender</span>
                      <p className="font-semibold text-foreground">{l.cattle?.teeth}T · {l.cattle?.gender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Station</span>
                      <p className="font-semibold text-foreground truncate">{l.stations?.station_name ?? '—'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {l.description && <p className="text-xs text-muted-foreground line-clamp-2 italic">{l.description}</p>}

                  {/* Listed date */}
                  <p className="text-[10px] text-muted-foreground/60 font-medium">Listed {new Date(l.listed_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex gap-1.5 pt-2">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 rounded-full flex-1 border-primary/20 text-primary hover:bg-primary/5" onClick={() => openEdit(l)}>
                        <Pencil className="h-3 w-3" />Edit
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 rounded-full flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => setMarkSoldId(l.id)}>
                        <CheckCircle2 className="h-3 w-3" />Sold
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 rounded-full border-destructive/20 text-destructive hover:bg-destructive/5 px-2.5" onClick={() => setRemoveId(l.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={open => { if (!open) resetCreate(); setCreateOpen(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{pickerOpen ? 'Choose Animal' : 'Create Listing'}</DialogTitle>
          </DialogHeader>

          {/* Inline animal picker */}
          {pickerOpen && (
            <div className="flex flex-col gap-3" style={{ minHeight: 320 }}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Search by tag or breed..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} autoFocus />
                </div>
                <Select value={pickerStatus || 'all'} onValueChange={v => setPickerStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ready_for_sale">Ready for Sale</SelectItem>
                    <SelectItem value="listed">Listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-y-auto max-h-60 space-y-1.5 pr-1">
                {(() => {
                  const filtered = readyAnimals.filter(a => {
                    const ms = !pickerSearch || a.cattle_code.toLowerCase().includes(pickerSearch.toLowerCase()) || a.breed.toLowerCase().includes(pickerSearch.toLowerCase());
                    const mst = !pickerStatus || a.status === pickerStatus;
                    return ms && mst;
                  });
                  if (filtered.length === 0) return <p className="text-center text-muted-foreground py-8 text-sm">No animals match.</p>;
                  return filtered.map(a => (
                    <button key={a.id} type="button"
                      className={`w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors hover:bg-sw-green-50 ${createForm.cattleId === a.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => { setCreateForm(p => ({ ...p, cattleId: a.id })); setPickerOpen(false); }}>
                      <div>
                        <span className="font-mono text-sm font-semibold">{a.cattle_code}</span>
                        <span className="text-muted-foreground text-sm ml-2">{a.breed} · {a.current_weight}kg</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">{a.status.replace(/_/g, ' ')}</Badge>
                    </button>
                  ));
                })()}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setPickerOpen(false)}>Back</Button>
              </DialogFooter>
            </div>
          )}

          {/* Create form */}
          {!pickerOpen && (
            <>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Select Animal</label>
                  <Button type="button" variant="outline" className="w-full justify-start font-normal"
                    onClick={() => { setPickerSearch(''); setPickerStatus(''); setPickerOpen(true); }}>
                    {createForm.cattleId
                      ? (() => { const a = readyAnimals.find(x => x.id === createForm.cattleId); return a ? `${a.cattle_code} — ${a.breed} (${a.current_weight}kg)` : 'Choose animal'; })()
                      : <span className="text-muted-foreground">Choose animal</span>}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Asking Price (PKR)</label>
                  <Input type="number" min="0" value={createForm.askingPrice} onChange={e => setCreateForm(p => ({ ...p, askingPrice: e.target.value }))} placeholder="e.g. 450000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">WhatsApp Contact</label>
                  <Input value={createForm.whatsapp} onChange={e => setCreateForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="e.g. 03001234567" />
                  <p className="text-[10px] text-muted-foreground">Buyers will use this number to contact you. Defaults to your farm phone.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} placeholder="Any additional notes for buyers" rows={2} />
                </div>
                <PhotoPicker photos={createPhotos} onChange={setCreatePhotos} />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { resetCreate(); setCreateOpen(false); }}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createSaving}>
                  {createSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Publish Listing
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editListing} onOpenChange={open => { if (!open) resetEdit(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Listing — {editListing?.cattle?.cattle_code}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Asking Price (PKR)</label>
              <Input type="number" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} placeholder="Any additional notes for buyers" />
            </div>
            <EditPhotoPicker
              existingUrls={editExistingUrls}
              newPhotos={editNewPhotos}
              onExistingChange={setEditExistingUrls}
              onNewChange={setEditNewPhotos}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetEdit}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editSaving}>
              {editSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Sold Confirm */}
      <Dialog open={!!markSoldId} onOpenChange={() => setMarkSoldId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />Mark as Sold
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will mark the listing as sold and update the animal status to &quot;Sold&quot;. The listing will be removed from the active marketplace.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMarkSoldId(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkSold} disabled={markSoldSaving}>
              {markSoldSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Confirm Sold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirm */}
      <Dialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />Confirm Remove
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the listing from the marketplace. The animal status will be moved to Active. All listing photos will be permanently deleted.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removeSaving}>
              {removeSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Remove Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trust Score Modal */}
      <Dialog open={trustOpen} onOpenChange={setTrustOpen}>
        <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">Farm Trust Score</DialogTitle>
          <div className="relative group">
            <button onClick={() => setTrustOpen(false)} className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white text-[#050f05]/60 hover:text-destructive rounded-full transition-all shadow-sm backdrop-blur-md opacity-70 group-hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
            <TrustScorePanel trustScore={trustScore} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplaceManagement;
