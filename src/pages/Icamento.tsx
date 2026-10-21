import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DiagramaGuindaste } from '../components/DiagramaGuindaste'
import { FolhaCampo } from '../components/FolhaCampo'
import { PastaDestino } from '../components/PastaDestino'
import { QuadroEsboco } from '../components/QuadroEsboco'
import { TabelaAcessorios } from '../components/TabelaAcessorios'
import { acimaDe75Fu, fuNaoCalculavel, unidadeDe } from '../icamento/calc'
import { RESPONSAVEIS } from '../icamento/campos'
import { gerarPdf } from '../icamento/gerarPdf'
import { LEMBRETES, LEMBRETE_FINAL, TITULO_LEMBRETES } from '../icamento/lembretes'
import { ID_ESBOCO, ORDEM_EDICAO, PONTOS } from '../icamento/pontos'
import { useIcamento } from '../icamento/useIcamento'
import { textoResultado } from '../lib/pasta'
import { usePastaDestino } from '../lib/usePastaDestino'

const PASSOS = ['Esquema', 'Acessórios', 'Revisar'] as const
const OPCIONAIS = ['pesoAcessorios', 'pesoContrapeso']
const MSG_FU = 'Não foi possível calcular o FU: confira os pesos e a capacidade (escreva 5000, sem ponto de milhar).'

/** Dados gerais que o Plano de Içamento usa e que são preenchidos no Checklist, na tela de Dados. */
const DADOS_DO_CHECKLIST = [
  { id: 'responsavel', rotulo: 'Responsável pela atividade' },
  { id: 'projeto', rotulo: 'Projeto' },
  { id: 'data', rotulo: 'Data' },
  { id: 'local', rotulo: 'Local' },
  { id: 'atividade', rotulo: 'Atividade' },
  { id: 'equipamento', rotulo: 'Equipamento de Guindar Utilizado (tipo e TAG)' },
  { id: 'carga', rotulo: 'Carga/Peça' },
  { id: 'gerencia', rotulo: 'Gerência' },
  { id: 'comoPeso', rotulo: 'Como foi obtido o peso da carga' },
]

export default function Icamento() {
  const api = useIcamento()
  const { data, dados } = api
  const [passo, setPasso] = useState(0)
  const [editando, setEditando] = useState<number | null>(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const destino = usePastaDestino()

  const unidade = unidadeDe(data)
  const idAtual = editando === null ? null : ORDEM_EDICAO[editando]
  const pontoAtual = idAtual && idAtual !== ID_ESBOCO ? PONTOS.find((p) => p.id === idAtual) : undefined

  const abrir = (id: string) => {
    const i = ORDEM_EDICAO.indexOf(id)
    if (i >= 0) setEditando(i)
  }
  const proximo = () => setEditando((i) => (i === null ? null : i + 1 < ORDEM_EDICAO.length ? i + 1 : null))
  const anterior = () => setEditando((i) => (i === null ? null : Math.max(0, i - 1)))

  const vazio = (chave: string) => !(data.campos[chave] ?? '').trim()
  const pendentes = [
    ...(fuNaoCalculavel(data) ? [MSG_FU] : []),
    ...PONTOS.filter((p) => p.tipo !== 'calculado' && !OPCIONAIS.includes(p.id) && vazio(p.id)).map((p) => p.rotulo),
    ...(data.esboco ? [] : ['Esboço da carga']),
  ]

  const faltamNoChecklist = [
    ...DADOS_DO_CHECKLIST.filter((c) => !(dados.campos[c.id] ?? '').trim()).map((c) => c.rotulo),
    ...RESPONSAVEIS.flatMap((r) => [
      ...((dados.campos[r.nome] ?? '').trim() ? [] : [`${r.titulo}: nome`]),
      ...(dados.assinaturas[r.assinatura] ? [] : [`${r.titulo}: assinatura`]),
    ]),
  ]

  const baixar = async () => {
    setGerando(true)
    setErro('')
    setAviso('')
    try {
      setAviso(textoResultado(await destino.emitir((pasta) => gerarPdf(data, dados, pasta))))
    } catch (e) {
      setErro(`Não foi possível gerar o PDF: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGerando(false)
    }
  }

  const novo = () => {
    if (window.confirm('Apagar o esquema e os acessórios e começar um novo plano? (Os dados do Checklist não são apagados.)')) {
      api.reset()
      setPasso(0)
      setErro('')
      setAviso('')
      setEditando(null)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" style={{ color: '#fff' }} aria-label="Início">⌂</Link>
        <h1>Plano Básico de Içamento de Carga</h1>
      </header>
      {!api.storageOk && <div className="aviso">Não foi possível salvar o rascunho automático neste navegador.</div>}

      <nav className="passos" aria-label="Etapas">
        {PASSOS.map((p, i) => (
          <button key={p} type="button" className={i === passo ? 'ativo' : ''} onClick={() => setPasso(i)}>
            {i + 1}. {p}
          </button>
        ))}
      </nav>

      {passo === 0 && (
        <>
          <h2>ESQUEMA DE IÇAMENTO</h2>
          <label className="campo">
            <span className="rotulo">Unidade dos pesos e capacidades</span>
            <select value={unidade} onChange={(e) => api.setCampo('unidade', e.target.value)} style={{ width: 120 }}>
              <option>Ton</option>
              <option>Kg</option>
            </select>
          </label>
          <p>
            <button type="button" className="btn primario" onClick={() => setEditando(0)}>Preencher campos</button>
          </p>
          <DiagramaGuindaste data={data} onSelecionar={abrir} />
          {fuNaoCalculavel(data) && <div className="aviso">{MSG_FU}</div>}
          {acimaDe75Fu(data) && (
            <div className="aviso">FU acima de 75%: solicite a emissão de um Plano de Rigging.</div>
          )}
        </>
      )}

      {passo === 1 && (
        <>
          <h2>LISTA DOS ACESSÓRIOS UTILIZADOS</h2>
          <TabelaAcessorios linhas={data.acessorios} onChange={api.setAcessorio} onAdd={api.addLinha} onRemove={api.removeLinha} />
        </>
      )}

      {passo === 2 && (
        <>
          <h2>Revisar e gerar PDF</h2>
          <p>
            <small>
              Os dados da atividade, do operador e do responsável pela amarração vêm do <Link to="/checklist">Checklist</Link> (tela Dados).
              Responsável: <strong>{dados.campos.responsavel || '—'}</strong> · Projeto: <strong>{dados.campos.projeto || '—'}</strong> · Carga/Peça:{' '}
              <strong>{dados.campos.carga || '—'}</strong>
            </small>
          </p>

          <div className="lembretes">
            <strong>{TITULO_LEMBRETES}</strong>
            <ul>
              {LEMBRETES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p><strong>{LEMBRETE_FINAL}</strong></p>
          </div>

          {faltamNoChecklist.length > 0 && (
            <>
              <div className="aviso">
                Faltam {faltamNoChecklist.length} dado(s) no <Link to="/checklist">Checklist</Link> (tela Dados), que saem neste PDF:
              </div>
              <ul className="pendentes">
                {faltamNoChecklist.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}
          {pendentes.length > 0 ? (
            <>
              <div className="aviso">{pendentes.length} item(ns) pendente(s) no esquema (o PDF pode ser gerado assim mesmo):</div>
              <ul className="pendentes">
                {pendentes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            faltamNoChecklist.length === 0 && <p>Tudo preenchido.</p>
          )}
          {erro && <div className="aviso">{erro}</div>}
          {aviso && <div className="aviso ok">{aviso}</div>}
          <PastaDestino suportado={destino.suportado} nome={destino.nome} escolher={destino.escolher} />
          <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn primario" onClick={baixar} disabled={gerando}>
              {gerando ? 'Gerando…' : 'Gerar PDF'}
            </button>
            <button type="button" className="btn perigo" onClick={novo}>Novo plano</button>
          </p>
        </>
      )}

      {pontoAtual && editando !== null && (
        <FolhaCampo
          ponto={pontoAtual}
          valor={data.campos[pontoAtual.id] ?? ''}
          unidade={unidade}
          posicao={`${editando + 1} de ${ORDEM_EDICAO.length}`}
          onChange={(v) => api.setCampo(pontoAtual.id, v)}
          onAnterior={anterior}
          onProximo={proximo}
          onFechar={() => setEditando(null)}
        />
      )}
      {idAtual === ID_ESBOCO && (
        <QuadroEsboco value={data.esboco} onChange={api.setEsboco} onAnterior={anterior} onConcluir={() => setEditando(null)} />
      )}

      <div className="rodape-nav">
        <button type="button" className="btn" disabled={passo === 0} onClick={() => setPasso(passo - 1)}>Voltar</button>
        <button type="button" className="btn primario" disabled={passo === PASSOS.length - 1} onClick={() => setPasso(passo + 1)}>
          Próximo
        </button>
      </div>
    </div>
  )
}
