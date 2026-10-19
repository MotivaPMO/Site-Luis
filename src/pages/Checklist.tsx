import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GRUPOS_LIBERACAO, GRUPOS_MAQUINA, GRUPO_IDENTIFICACAO, TITULO_LIBERACAO } from '../checklist/grupos'
import { SECOES } from '../checklist/itens'
import { useChecklist } from '../checklist/useChecklist'
import { gerarPdf } from '../checklist/gerarPdf'
import { GrupoView } from '../components/GrupoView'
import { ItemView } from '../components/ItemView'
import { PastaDestino } from '../components/PastaDestino'
import { textoResultado } from '../lib/pasta'
import { usePastaDestino } from '../lib/usePastaDestino'

const PASSOS = ['Máquina', 'Equipe', 'Liberação', 'Dados', 'Revisar'] as const

export default function Checklist() {
  const api = useChecklist()
  const [passo, setPasso] = useState(0)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const destino = usePastaDestino()

  const pendentes = [
    ...GRUPO_IDENTIFICACAO.campos.filter((c) => !(api.data.campos[c.id] ?? '').trim()).map((c) => `${c.label} (nome do arquivo PDF)`),
    ...SECOES.flatMap((s) =>
      s.itens.filter((i) => !api.data.respostas[i.id]).map((i) => `${s.titulo.split(' ')[0]} ${i.texto.slice(0, 70)}…`),
    ),
  ]

  const baixar = async () => {
    setGerando(true)
    setErro('')
    setAviso('')
    try {
      setAviso(textoResultado(await destino.emitir((pasta) => gerarPdf(api.data, pasta))))
    } catch (e) {
      setErro(`Não foi possível gerar o PDF: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGerando(false)
    }
  }

  const novo = () => {
    if (window.confirm('Apagar tudo e começar um novo checklist?')) {
      api.reset()
      setPasso(0)
      setErro('')
      setAviso('')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" style={{ color: '#fff' }} aria-label="Início">⌂</Link>
        <h1>Plano para Movimentação de Carga</h1>
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
          <h2>DIMENSIONAMENTO DA MÁQUINA E ACESSÓRIOS</h2>
          {GRUPOS_MAQUINA.map((g) => (
            <GrupoView key={g.id} grupo={g} api={api} />
          ))}
        </>
      )}

      {(passo === 1 || passo === 2) && (
        <>
          <h2>{SECOES[passo - 1].titulo}</h2>
          {SECOES[passo - 1].itens.map((item, i) => (
            <ItemView key={item.id} item={item} numero={i + 1} api={api} />
          ))}
        </>
      )}

      {passo === 3 && (
        <>
          <h2>{TITULO_LIBERACAO}</h2>
          {[GRUPO_IDENTIFICACAO, ...GRUPOS_LIBERACAO].map((g) => (
            <GrupoView key={g.id} grupo={g} api={api} />
          ))}
        </>
      )}

      {passo === 4 && (
        <>
          <h2>Revisar e gerar PDF</h2>
          {pendentes.length > 0 ? (
            <>
              <div className="aviso">{pendentes.length} item(ns) sem resposta (o PDF pode ser gerado assim mesmo):</div>
              <ul className="pendentes">
                {pendentes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Todos os itens foram respondidos.</p>
          )}
          {erro && <div className="aviso">{erro}</div>}
          {aviso && <div className="aviso ok">{aviso}</div>}
          <PastaDestino suportado={destino.suportado} nome={destino.nome} escolher={destino.escolher} />
          <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn primario" onClick={baixar} disabled={gerando}>
              {gerando ? 'Gerando…' : 'Gerar PDF'}
            </button>
            <button type="button" className="btn perigo" onClick={novo}>Novo checklist</button>
          </p>
        </>
      )}

      <div className="rodape-nav">
        <button type="button" className="btn" disabled={passo === 0} onClick={() => setPasso(passo - 1)}>
          Voltar
        </button>
        <button type="button" className="btn primario" disabled={passo === PASSOS.length - 1} onClick={() => setPasso(passo + 1)}>
          Próximo
        </button>
      </div>
    </div>
  )
}
