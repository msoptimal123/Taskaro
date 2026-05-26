import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const ACCENT = '#C2692A';
const LIGHT_BG = '#F5F3EF';
const MUTED = '#888888';
const BORDER = '#D9D4CB';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 45,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  companyBlock: {
    flexDirection: 'column',
    maxWidth: 220,
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  companyLine: {
    fontSize: 9,
    marginBottom: 2,
    color: '#444444',
  },
  logoContainer: {
    width: 90,
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    height: 60,
    objectFit: 'contain',
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 20,
  },
  // Quote header
  quoteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  ponudbaTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 1,
  },
  quoteMetaBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  quoteMeta: {
    fontSize: 9,
    marginBottom: 3,
    color: '#444444',
  },
  quoteMetaLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  // Client box
  clientBox: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    padding: 10,
    minWidth: 180,
    maxWidth: 220,
    marginBottom: 24,
    backgroundColor: LIGHT_BG,
  },
  clientLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 8,
    color: '#555555',
    marginBottom: 1,
  },
  // opomba_zacetna
  opombaZacetna: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 16,
    lineHeight: 1.5,
  },
  // Table
  table: {
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    borderRadius: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDEA',
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BG,
  },
  tableCell: {
    fontSize: 8,
    paddingHorizontal: 4,
    color: '#1A1A1A',
  },
  tableCellDesc: {
    fontSize: 7,
    color: MUTED,
    paddingHorizontal: 4,
    marginTop: 1,
  },
  // Column widths
  colNr: { width: '5%' },
  colNaziv: { width: '35%' },
  colEnota: { width: '10%' },
  colKolicina: { width: '12%', textAlign: 'right' },
  colCena: { width: '18%', textAlign: 'right' },
  colSkupaj: { width: '20%', textAlign: 'right' },
  // Totals
  totalsContainer: {
    alignSelf: 'flex-end',
    width: 220,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: ACCENT,
    borderRadius: 2,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 9,
    color: '#444444',
  },
  totalValue: {
    fontSize: 9,
    color: '#444444',
    fontFamily: 'Helvetica-Bold',
  },
  totalLabelFinal: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
  },
  totalValueFinal: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 45,
    right: 45,
  },
  footerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: MUTED,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  footerPayment: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  footerPaymentItem: {
    fontSize: 7.5,
    color: '#555555',
  },
  footerPaymentLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
  },
});

function formatCurrency(amount: number): string {
  return amount.toLocaleString('sl-SI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export interface PonudbaPDFProps {
  ponudba: {
    stevilka: string;
    naslov?: string | null;
    opomba_zacetna?: string | null;
    opomba_koncna?: string | null;
    ddv_stopnja: number;
    skupaj_brez_ddv: number;
    ddv_znesek: number;
    skupaj_z_ddv: number;
    veljavna_do?: string | null;
    created_at: string;
  };
  postavke: Array<{
    vrstni_red: number;
    naziv: string;
    opis?: string | null;
    enota?: string | null;
    kolicina: number;
    cena_na_enoto: number;
    skupaj: number;
  }>;
  client: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  company: {
    naziv?: string | null;
    naslov_ulica?: string | null;
    naslov_posta?: string | null;
    davcna_stevilka?: string | null;
    iban?: string | null;
    bic_swift?: string | null;
    banka?: string | null;
    logo_path?: string | null;
  };
}

export default function PonudbaPDF({ ponudba, postavke, client, company }: PonudbaPDFProps) {
  const sorted = [...postavke].sort((a, b) => a.vrstni_red - b.vrstni_red);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header: company info left, logo right */}
        <View style={styles.headerRow}>
          <View style={styles.companyBlock}>
            {company.naziv && (
              <Text style={styles.companyName}>{company.naziv}</Text>
            )}
            {company.naslov_ulica && (
              <Text style={styles.companyLine}>{company.naslov_ulica}</Text>
            )}
            {company.naslov_posta && (
              <Text style={styles.companyLine}>{company.naslov_posta}</Text>
            )}
            {company.davcna_stevilka && (
              <Text style={styles.companyLine}>
                DDV zavezanec: SI{company.davcna_stevilka}
              </Text>
            )}
            {company.iban && (
              <Text style={styles.companyLine}>IBAN: {company.iban}</Text>
            )}
            {company.banka && (
              <Text style={styles.companyLine}>{company.banka}</Text>
            )}
          </View>

          {company.logo_path && (
            <View style={styles.logoContainer}>
              <Image style={styles.logo} src={company.logo_path} />
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Quote header: title left, meta right */}
        <View style={styles.quoteHeaderRow}>
          <View>
            <Text style={styles.ponudbaTitle}>PONUDBA</Text>
            {ponudba.naslov && (
              <Text style={{ fontSize: 10, color: '#555555', marginTop: 4 }}>
                {ponudba.naslov}
              </Text>
            )}
          </View>
          <View style={styles.quoteMetaBlock}>
            <Text style={styles.quoteMeta}>
              <Text style={styles.quoteMetaLabel}>Številka: </Text>
              {ponudba.stevilka}
            </Text>
            <Text style={styles.quoteMeta}>
              <Text style={styles.quoteMetaLabel}>Datum: </Text>
              {formatDate(ponudba.created_at)}
            </Text>
            {ponudba.veljavna_do && (
              <Text style={styles.quoteMeta}>
                <Text style={styles.quoteMetaLabel}>Veljavno do: </Text>
                {formatDate(ponudba.veljavna_do)}
              </Text>
            )}
          </View>
        </View>

        {/* Client box — right-aligned */}
        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Naročnik:</Text>
          <Text style={styles.clientName}>{client.name}</Text>
          {client.phone && (
            <Text style={styles.clientDetail}>{client.phone}</Text>
          )}
          {client.email && (
            <Text style={styles.clientDetail}>{client.email}</Text>
          )}
        </View>

        {/* Opening note */}
        {ponudba.opomba_zacetna && (
          <Text style={styles.opombaZacetna}>{ponudba.opomba_zacetna}</Text>
        )}

        {/* Items table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colNr]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colNaziv]}>Naziv</Text>
            <Text style={[styles.tableHeaderCell, styles.colEnota]}>Enota</Text>
            <Text style={[styles.tableHeaderCell, styles.colKolicina]}>Količina</Text>
            <Text style={[styles.tableHeaderCell, styles.colCena]}>Cena/enoto</Text>
            <Text style={[styles.tableHeaderCell, styles.colSkupaj]}>Skupaj</Text>
          </View>

          {/* Data rows */}
          {sorted.map((p, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.colNr]}>{p.vrstni_red}</Text>
              <View style={styles.colNaziv}>
                <Text style={styles.tableCell}>{p.naziv}</Text>
                {p.opis && <Text style={styles.tableCellDesc}>{p.opis}</Text>}
              </View>
              <Text style={[styles.tableCell, styles.colEnota]}>{p.enota ?? ''}</Text>
              <Text style={[styles.tableCell, styles.colKolicina]}>
                {p.kolicina.toLocaleString('sl-SI')}
              </Text>
              <Text style={[styles.tableCell, styles.colCena]}>
                {formatCurrency(p.cena_na_enoto)}
              </Text>
              <Text style={[styles.tableCell, styles.colSkupaj]}>
                {formatCurrency(p.skupaj)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals block */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Skupaj brez DDV</Text>
            <Text style={styles.totalValue}>{formatCurrency(ponudba.skupaj_brez_ddv)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>DDV {ponudba.ddv_stopnja}%</Text>
            <Text style={styles.totalValue}>{formatCurrency(ponudba.ddv_znesek)}</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>SKUPAJ</Text>
            <Text style={styles.totalValueFinal}>{formatCurrency(ponudba.skupaj_z_ddv)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          {ponudba.opomba_koncna && (
            <Text style={styles.footerText}>{ponudba.opomba_koncna}</Text>
          )}
          {(company.iban || company.bic_swift) && (
            <View style={styles.footerPayment}>
              {company.iban && (
                <Text style={styles.footerPaymentItem}>
                  <Text style={styles.footerPaymentLabel}>IBAN: </Text>
                  {company.iban}
                </Text>
              )}
              {company.bic_swift && (
                <Text style={styles.footerPaymentItem}>
                  <Text style={styles.footerPaymentLabel}>BIC/SWIFT: </Text>
                  {company.bic_swift}
                </Text>
              )}
            </View>
          )}
        </View>

      </Page>
    </Document>
  );
}
