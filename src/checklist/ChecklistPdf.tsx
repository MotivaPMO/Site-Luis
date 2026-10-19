import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Campo, Grupo, Item } from './definicao'
import { GRUPOS_LIBERACAO, GRUPOS_MAQUINA, TITULO_LIBERACAO } from './grupos'
import { SECOES } from './itens'
import { relacaoEfetiva } from './calc'
import { formatarData, formatarHora } from './format'
import type { ChecklistData } from './schema'

const LINHA = '________________'
const PRETO = '#000'

const s = StyleSheet.create({
  page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: PRETO },
  logo: { width: 90, height: 34, margin: 4, objectFit: 'contain' },
  titulo: { flex: 1, textAlign: 'center', fontSize: 12, fontFamily: 'Helvetica-Bold' },
  banner: { flexDirection: 'row', backgroundColor: '#d9d9d9', borderWidth: 1, borderTopWidth: 0, borderColor: PRETO, padding: 3, fontFamily: 'Helvetica-Bold' },
  bannerTexto: { flex: 1 },
  cols: { flexDirection: 'row' },
  col: { flex: 1, borderWidth: 1, borderTopWidth: 0, borderColor: PRETO, padding: 4 },
  colTitulo: { fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  linha: { marginBottom: 3 },
  row: { flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: PRETO },
  rowTexto: { flex: 1, padding: 3 },
  snn: { width: 26, borderLeftWidth: 1, borderColor: PRETO, alignItems: 'center', justifyContent: 'center' },
  snnTitulo: { width: 26, textAlign: 'center' },
  assin: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  assinImg: { width: 90, height: 26, objectFit: 'contain' },
  idBox: { width: 150, padding: 3, borderLeftWidth: 1, borderColor: PRETO, alignSelf: 'stretch' },
  idRotulo: { fontSize: 6, fontFamily: 'Helvetica-Bold' },
  idValor: { fontSize: 7.5, marginBottom: 2 },
})

function textoCampo(c: Campo, d: ChecklistData): string {
  if (c.kind === 'escolha') {
    const v = d.campos[c.id]
    return c.opcoes.map((o) => `(${v === o ? 'X' : '   '}) ${o}`).join('    ')
  }
  if (c.kind !== 'texto') {
    const fmt = c.kind === 'data' ? formatarData : formatarHora
    return fmt(d.campos[c.id] ?? '') || LINHA
  }
  const v = c.calculado ? relacaoEfetiva(d) : (d.campos[c.id] ?? '')
  if (!v.trim()) return LINHA
  const un = c.unidades ? ` ${d.campos[`${c.id}.unidade`] ?? c.unidades[0]}` : ''
  return `${v}${un}${c.calculado && !v.includes('%') ? '%' : ''}`
}

function AssinaturaPdf({ label, src }: { label: string; src?: string }) {
  return (
    <View style={s.assin}>
      <Text>{label}: </Text>
      {src ? <Image src={src} style={s.assinImg} /> : <Text>{LINHA}</Text>}
    </View>
  )
}

function GrupoPdf({ g, d }: { g: Grupo; d: ChecklistData }) {
  return (
    <View style={s.col} wrap={false}>
      <Text style={s.colTitulo}>{g.titulo}</Text>
      {g.campos.map((c) => (
        <Text key={c.id} style={s.linha}>
          {c.label}: {textoCampo(c, d)}
        </Text>
      ))}
      {g.assinaturas?.map((a) => (
        <AssinaturaPdf key={a.id} label={a.label} src={d.assinaturas[a.id]} />
      ))}
    </View>
  )
}

function ItemPdf({ item, d }: { item: Item; d: ChecklistData }) {
  const curtas = item.marcas?.every((m) => m.label.length < 28)
  const marcadas = item.marcas?.map((m) => `(${d.marcas[`${item.id}.${m.id}`] ? 'X' : '   '}) ${m.label}`)
  return (
    <View style={s.row} wrap={false}>
      <View style={s.rowTexto}>
        <Text>{item.texto}</Text>
        {marcadas && (curtas ? <Text>{marcadas.join('     ')}</Text> : marcadas.map((t) => <Text key={t}>{t}</Text>))}
        {item.campos?.map((c) => (
          <Text key={c.id}>
            {c.label}: {textoCampo(c, d)}
          </Text>
        ))}
        {item.assinatura && <AssinaturaPdf label={item.assinatura.label} src={d.assinaturas[item.assinatura.id]} />}
      </View>
      {(['S', 'N', 'NA'] as const).map((r) => (
        <View key={r} style={s.snn}>
          <Text>{d.respostas[item.id] === r ? 'X' : ''}</Text>
        </View>
      ))}
    </View>
  )
}

export function ChecklistPdf({ data, logoSrc }: { data: ChecklistData; logoSrc?: string }) {
  return (
    <Document title="Plano para Movimentação de Carga">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {logoSrc && <Image src={logoSrc} style={s.logo} />}
          <Text style={s.titulo}>PLANO PARA MOVIMENTAÇÃO DE CARGA</Text>
          <View style={s.idBox}>
            <Text style={s.idRotulo}>Supervisor:</Text>
            <Text style={s.idValor}>{data.campos.supervisor ?? ''}</Text>
            <Text style={s.idRotulo}>Projeto:</Text>
            <Text style={s.idValor}>{data.campos.projeto ?? ''}</Text>
          </View>
        </View>
        <View style={s.banner}>
          <Text style={s.bannerTexto}>DIMENSIONAMENTO DA MÁQUINA E ACESSÓRIOS</Text>
        </View>
        <View style={s.cols}>
          {GRUPOS_MAQUINA.map((g) => (
            <GrupoPdf key={g.id} g={g} d={data} />
          ))}
        </View>

        {SECOES.map((sec) => (
          <View key={sec.id}>
            <View style={s.banner} wrap={false}>
              <Text style={s.bannerTexto}>{sec.titulo}</Text>
              <Text style={s.snnTitulo}>S</Text>
              <Text style={s.snnTitulo}>N</Text>
              <Text style={s.snnTitulo}>NA</Text>
            </View>
            {sec.itens.map((i) => (
              <ItemPdf key={i.id} item={i} d={data} />
            ))}
          </View>
        ))}

        <View style={s.banner} wrap={false}>
          <Text style={s.bannerTexto}>{TITULO_LIBERACAO}</Text>
        </View>
        <View style={s.cols} wrap={false}>
          {GRUPOS_LIBERACAO.map((g) => (
            <GrupoPdf key={g.id} g={g} d={data} />
          ))}
        </View>
      </Page>
    </Document>
  )
}
