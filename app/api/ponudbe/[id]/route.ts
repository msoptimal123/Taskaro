import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type PostavkaInput = {
  id?: string;
  vrstni_red: number;
  naziv: string;
  opis?: string | null;
  enota?: string | null;
  kolicina: number;
  cena_na_enoto: number;
  skupaj: number;
};

type UpdatePonudbaBody = {
  naslov?: string | null;
  opomba_zacetna?: string | null;
  opomba_koncna?: string | null;
  ddv_stopnja?: number;
  veljavna_do?: string | null;
  postavke?: PostavkaInput[];
};

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as UpdatePonudbaBody;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Recalculate totals if postavke provided
  let totals: Record<string, number> = {};
  if (body.postavke) {
    const ddvStopnja = body.ddv_stopnja ?? 22;
    const skupajBrezDdv = body.postavke.reduce((s, p) => s + p.skupaj, 0);
    const ddvZnesek = skupajBrezDdv * (ddvStopnja / 100);
    totals = {
      skupaj_brez_ddv: skupajBrezDdv,
      ddv_znesek: ddvZnesek,
      skupaj_z_ddv: skupajBrezDdv + ddvZnesek,
    };
  }

  // Update ponudba
  const { error: updateErr } = await db
    .from('ponudbe')
    .update({
      naslov: body.naslov,
      opomba_zacetna: body.opomba_zacetna,
      opomba_koncna: body.opomba_koncna,
      ddv_stopnja: body.ddv_stopnja,
      veljavna_do: body.veljavna_do,
      ...totals,
    })
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Replace postavke if provided
  if (body.postavke) {
    await db.from('ponudba_postavke').delete().eq('ponudba_id', params.id);
    if (body.postavke.length > 0) {
      const { error: postavkeErr } = await db
        .from('ponudba_postavke')
        .insert(body.postavke.map(p => ({
          ponudba_id: params.id,
          vrstni_red: p.vrstni_red,
          naziv: p.naziv,
          opis: p.opis ?? null,
          enota: p.enota ?? null,
          kolicina: p.kolicina,
          cena_na_enoto: p.cena_na_enoto,
          skupaj: p.skupaj,
        })));
      if (postavkeErr) return NextResponse.json({ error: postavkeErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('ponudbe')
    .update({ status: 'preklicana' })
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
