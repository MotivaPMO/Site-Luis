import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ComponentProps } from 'react'
import { formatarData } from '../checklist/format'
import { textoPonto } from './calc'
import { CAMPOS_CABECALHO, NOTA_ASSINATURA, RESPONSAVEIS, ROTULO_COMO_PESO } from './campos'
import { LEMBRETES, LEMBRETE_FINAL, TITULO_LEMBRETES } from './lembretes'
import { ALTURA_IMG, AREA_ESBOCO, LARGURA_IMG, PONTOS } from './pontos'
import type { IcamentoData } from './schema'

type Fonte = Extract<ComponentProps<typeof Image>, { src: unknown }>['src']

const PRETO = '#000'
const LARG = 547 // largura útil da página A4 (595 - 2×24)
const ESCALA = LARG / LARGURA_IMG
const ALT = (LARG * ALTURA_IMG) / LARGURA_IMG
const pctL = (v: number) => `${(v / LARGURA_IMG) * 100}%`
const pctA = (v: number) => `${(v / ALTURA_IMG) * 100}%`
const MIN_LINHAS = 4

const s = StyleSheet.create({
  page: { padding: 24, fontSize: 8, fontFamily: 'Helvetica' },
  linha: { flexDirection: 'row' },
  cel: { borderWidth: 1, borderColor: PRETO, padding: 3, marginLeft: -1, marginTop: -1 },
  rotulo: { fontSize: 6.5, fontFamily: 'Helvetica-Bold' },
  valor: { fontSize: 8, marginTop: 2 },
  logo: { width: 80, height: 30, objectFit: 'contain' },
  titulo: { textAlign: 'center', fontSize: 10, fontFamily: 'Helvetica-Bold' },
  subtitulo: { textAlign: 'center', fontSize: 9 },
  banner: { backgroundColor: '#bfbfbf', borderWidth: 1, borderColor: PRETO, marginTop: -1, padding: 3, alignItems: 'center' },
  bannerTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  bannerSub: { fontSize: 5.5, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  diagrama: { width: LARG, height: ALT, borderWidth: 1, borderColor: PRETO, marginTop: -1 },
  tabelaTitulo: { backgroundColor: '#bfbfbf', borderWidth: 1, borderColor: PRETO, padding: 2, textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 8, marginTop: 6 },
  celTab: { borderWidth: 1, borderColor: PRETO, marginLeft: -1, marginTop: -1, padding: 2, minHeight: 12 },
  celTabCab: { backgroundColor: '#d9d9d9', fontFamily: 'Helvetica-Bold', fontSize: 6.5 },
  lembretes: { borderWidth: 1, borderColor: PRETO, marginTop: 6, padding: 4, fontSize: 6.5, backgroundColor: '#f2f2f2' },
  assinImg: { width: 80, height: 22, objectFit: 'contain' },
})

function Celula({ rotulo, valor, flex }: { rotulo: string; valor: string; flex: number }) {
  return (
    <View style={[s.cel, { flex }]}>
      <Text style={s.rotulo}>{rotulo}:</Text>
      <Text style={s.valor}>{valor}</Text>
    </View>
  )
}

export function IcamentoPdf({ data, esquemaSrc, logoSrc }: { data: IcamentoData; esquemaSrc: Fonte; logoSrc?: string }) {
  const campos = data.campos
  const cab = (id: string) => {
    const c = CAMPOS_CABECALHO.find((x) => x.id === id)!
    return { rotulo: c.label, valor: c.kind === 'data' ? formatarData(campos[id] ?? '') : (campos[id] ?? '') }
  }
  const linhas = [...data.acessorios]
  while (linhas.length < MIN_LINHAS) linhas.push({ descricao: '', capacidade: '', quantidade: '' })

  return (
    <Document title="Plano Básico de Içamento de Carga">
      <Page size="A4" style={s.page}>
        <View style={s.linha}>
          <View style={[s.cel, { flex: 193, justifyContent: 'center' }]}>{logoSrc && <Image src={logoSrc} style={s.logo} />}</View>
          <View style={[s.cel, { flex: 235 + 200, justifyContent: 'center' }]}>
            <Text style={s.titulo}>Plano Básico de Içamento de Carga</Text>
            <Text style={s.subtitulo}>(Guindastes)</Text>
          </View>
          <View style={[s.cel, { flex: 154 }]} />
        </View>
        <View style={s.linha}>
          <Celula {...cab('local')} flex={193} />
          <Celula {...cab('atividade')} flex={235 + 200 + 154} />
        </View>
        <View style={s.linha}>
          <Celula {...cab('equipamento')} flex={193} />
          <Celula {...cab('carga')} flex={235} />
          <Celula {...cab('gerencia')} flex={200} />
          <Celula {...cab('data')} flex={154} />
        </View>
        <View style={s.linha}>
          <Celula rotulo={ROTULO_COMO_PESO.replace(/\?$/, '')} valor={campos.comoPeso ?? ''} flex={1} />
        </View>

        <View style={s.banner}>
          <Text style={s.bannerTitulo}>ESQUEMA DE IÇAMENTO</Text>
          <Text style={s.bannerSub}>(FORMALIZE AQUI O DETALHAMENTO DO SEU IÇAMENTO CONFORME A SEQUÊNCIA DAS INFORMAÇÕES SOLICITADAS EM CADA CAMPO</Text>
          <Text style={s.bannerSub}>INCLUINDO O ESBOÇO DE COMO A CARGA SERÁ “AMARRADA”</Text>
        </View>
        <View style={s.diagrama}>
          <Image src={esquemaSrc} style={{ width: LARG - 2, height: ALT - 2 }} />
          {PONTOS.map((p) => {
            const texto = textoPonto(data, p)
            if (!texto) return null
            return (
              <View
                key={p.id}
                style={{ position: 'absolute', left: pctL(p.x), top: pctA(p.y), width: pctL(p.w), height: pctA(p.h), justifyContent: 'center', paddingLeft: 2 }}
              >
                <Text style={{ fontSize: p.h * 0.42 * ESCALA, fontFamily: 'Helvetica-Bold', color: '#0b3d91' }}>
                  {texto}
                </Text>
              </View>
            )
          })}
          {data.esboco ? (
            <Image
              src={data.esboco}
              style={{ position: 'absolute', left: pctL(AREA_ESBOCO.x), top: pctA(AREA_ESBOCO.y), width: pctL(AREA_ESBOCO.w), height: pctA(AREA_ESBOCO.h), objectFit: 'contain' }}
            />
          ) : null}
        </View>

        <Text style={s.tabelaTitulo}>LISTA DOS ACESSÓRIOS UTILIZADOS</Text>
        <View style={s.linha}>
          <Text style={[s.celTab, s.celTabCab, { flex: 58 }]}>ACESSÓRIO / DIMENSÃO</Text>
          <Text style={[s.celTab, s.celTabCab, { flex: 21, textAlign: 'center' }]}>CAPACIDADE</Text>
          <Text style={[s.celTab, s.celTabCab, { flex: 21, textAlign: 'center' }]}>QUANTIDADE</Text>
        </View>
        {linhas.map((l, i) => (
          <View key={i} style={s.linha} wrap={false}>
            <Text style={[s.celTab, { flex: 58 }]}>{l.descricao}</Text>
            <Text style={[s.celTab, { flex: 21, textAlign: 'center' }]}>{l.capacidade}</Text>
            <Text style={[s.celTab, { flex: 21, textAlign: 'center' }]}>{l.quantidade}</Text>
          </View>
        ))}

        <View style={s.lembretes} wrap={false}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{TITULO_LEMBRETES}</Text>
          {LEMBRETES.map((t) => (
            <Text key={t}>- {t}</Text>
          ))}
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>- {LEMBRETE_FINAL}</Text>
        </View>

        <View style={{ marginTop: 6 }} wrap={false}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 6.5 }}>Assinaturas:</Text>
          <View style={s.linha}>
            <Text style={[s.celTab, s.celTabCab, { flex: 30, borderWidth: 0 }]} />
            <Text style={[s.celTab, s.celTabCab, { flex: 40, textAlign: 'center', borderWidth: 0 }]}>Nome do Empregado</Text>
            <Text style={[s.celTab, s.celTabCab, { flex: 14, textAlign: 'center', borderWidth: 0 }]}>Matrícula / CPF</Text>
            <Text style={[s.celTab, s.celTabCab, { flex: 16, textAlign: 'center', borderWidth: 0 }]}>Assinatura</Text>
          </View>
          {RESPONSAVEIS.map((r) => (
            <View key={r.id} style={s.linha}>
              <Text style={[s.celTab, { flex: 30, minHeight: 28 }]}>{r.titulo}</Text>
              <Text style={[s.celTab, { flex: 40 }]}>{campos[r.nome] ?? ''}</Text>
              <Text style={[s.celTab, { flex: 14 }]}>{campos[r.doc] ?? ''}</Text>
              <View style={[s.celTab, { flex: 16, justifyContent: 'center' }]}>
                {data.assinaturas[r.assinatura] ? <Image src={data.assinaturas[r.assinatura]} style={s.assinImg} /> : null}
              </View>
            </View>
          ))}
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 5.5, marginTop: 2 }}>{NOTA_ASSINATURA}</Text>
        </View>
      </Page>
    </Document>
  )
}
