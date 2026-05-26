import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import PonudbaPDF from '@/lib/pdf/PonudbaPDF';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  // Fetch ponudba (owned by this user)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ponudba, error: ponudbaError } = await (supabase as any)
    .from('ponudbe')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: AnyRecord | null; error: unknown };

  if (ponudbaError || !ponudba) {
    return NextResponse.json({ error: 'Ponudba not found' }, { status: 404 });
  }

  // Fetch postavke
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: postavke } = await (supabase as any)
    .from('ponudba_postavke')
    .select('*')
    .eq('ponudba_id', id)
    .order('vrstni_red', { ascending: true }) as { data: AnyRecord[] | null };

  // Fetch client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client } = ponudba.client_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (supabase as any)
        .from('clients')
        .select('name, email, phone')
        .eq('id', ponudba.client_id)
        .single() as { data: AnyRecord | null }
    : { data: null };

  // Fetch company_settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: company } = await (supabase as any)
    .from('company_settings')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: AnyRecord | null };

  // Build PDF props
  const pdfProps = {
    ponudba: {
      stevilka: ponudba.stevilka as string,
      naslov: (ponudba.naslov as string | null) ?? null,
      opomba_zacetna: (ponudba.opomba_zacetna as string | null) ?? null,
      opomba_koncna: (ponudba.opomba_koncna as string | null) ?? null,
      ddv_stopnja: ponudba.ddv_stopnja as number,
      skupaj_brez_ddv: ponudba.skupaj_brez_ddv as number,
      ddv_znesek: ponudba.ddv_znesek as number,
      skupaj_z_ddv: ponudba.skupaj_z_ddv as number,
      veljavna_do: (ponudba.veljavna_do as string | null) ?? null,
      created_at: ponudba.created_at as string,
    },
    postavke: (postavke ?? []).map((p: AnyRecord) => ({
      vrstni_red: p.vrstni_red as number,
      naziv: p.naziv as string,
      opis: (p.opis as string | null) ?? null,
      enota: (p.enota as string | null) ?? null,
      kolicina: p.kolicina as number,
      cena_na_enoto: p.cena_na_enoto as number,
      skupaj: p.skupaj as number,
    })),
    client: {
      name: (client?.name as string) ?? 'Neznana stranka',
      email: (client?.email as string | null) ?? null,
      phone: (client?.phone as string | null) ?? null,
    },
    company: company
      ? {
          naziv: (company.naziv as string | null) ?? null,
          naslov_ulica: (company.naslov_ulica as string | null) ?? null,
          naslov_posta: (company.naslov_posta as string | null) ?? null,
          davcna_stevilka: (company.davcna_stevilka as string | null) ?? null,
          iban: (company.iban as string | null) ?? null,
          bic_swift: (company.bic_swift as string | null) ?? null,
          banka: (company.banka as string | null) ?? null,
          logo_path: (company.logo_path as string | null) ?? null,
        }
      : {},
  };

  // Generate PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(PonudbaPDF, pdfProps) as any;
  const buffer = await renderToBuffer(element);

  const stevilka = (ponudba.stevilka as string).replace(/\//g, '-');

  return new Response(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ponudba-${stevilka}.pdf"`,
      'Content-Length': String(buffer.length),
    },
  });
}
