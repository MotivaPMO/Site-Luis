import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CampoInput } from '../components/CampoInput'
import { DiagramaGuindaste } from '../components/DiagramaGuindaste'
import { FolhaCampo } from '../components/FolhaCampo'
import { QuadroEsboco } from '../components/QuadroEsboco'
import { SignaturePad } from '../components/SignaturePad'
import { TabelaAcessorios } from '../components/TabelaAcessorios'
import { acimaDe75Fu, unidadeDe } from '../icamento/calc'
import { CAMPOS_CABECALHO, NOTA_ASSINATURA, RESPONSAVEIS, ROTULO_COMO_PESO } from '../icamento/campos'
import { gerarPdf } from '../icamento/gerarPdf'
import { LEMBRETES, LEMBRETE_FINAL, TITULO_LEMBRETES } from '../icamento/lembretes'
import { ID_ESBOCO, ORDEM_EDICAO, PONTOS } from '../icamento/pontos'
import { useIcamento } from '../icamento/useIcamento'

const PASSOS = ['Dados', 'Esquema', 'Acessórios', 'Assinaturas'] as const
const OPCIONAIS = ['pesoAcessorios', 'pesoContrapeso']

export default function Icamento() {
  const api = useIcamento()
  const { data } = api
  const [passo, setPasso] = useState(0)
  const [editando, setEditando] = useState<number | null>(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

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
    ...CAMPOS_CABECALHO.filter((c) => vazio(c.id)).map((c) => c.label),
    ...(vazio('comoPeso') ? [ROTULO_COMO_PESO] : []),
    ...PONTOS.filter((p) => p.tipo !== 'calculado' && !OPCIONAIS.includes(p.id) && vazio(p.id)).map((p) => p.rotulo),
    ...(data.esboco ? [] : ['Esboço da carga']),
    ...RESPONSAVEIS.flatMap((r) => [
      ...(vazio(r.nome) ? [`${r.titulo}: nome`] : []),
      ...(data.assinaturas[r.assinatura] ? [] : [`${r.titulo}: assinatura`]),
    ]),
  ]

  const baixar = async () => {
    setGerando(true)
    setErro('')
    try {
      await gerarPdf(data)
    } catch (e) {
      setErro(`Não foi possível gerar o PDF: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGerando(false)
    }
  }

  const novo = () => {
    if (window.confirm('Apagar tudo e começar um novo plano?')) {
      api.reset()
      setPasso(0)
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
        <section className="grupo">
          <h3>DADOS DA ATIVIDADE</h3>
          {CAMPOS_CABECALHO.map((c) => (
            <CampoInput key={c.id} campo={c} campos={data.campos} onChange={api.setCampo} />
          ))}
          <label className="campo">
            <span className="rotulo">{ROTULO_COMO_PESO}</span>
            <textarea value={data.campos.comoPeso ?? ''} onChange={(e) => api.setCampo('comoPeso', e.target.value)} />
          </label>
        </section>
      )}

      {passo === 1 && (
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
          {acimaDe75Fu(data) && (
            <div className="aviso">FU acima de 75%: solicite a emissão de um Plano de Rigging.</div>
          )}
        </>
      )}

      {passo === 2 && (
        <>
          <h2>LISTA DOS ACESSÓRIOS UTILIZADOS</h2>
          <TabelaAcessorios linhas={data.acessorios} onChange={api.setAcessorio} onAdd={api.addLinha} onRemove={api.removeLinha} />
        </>
      )}

      {passo === 3 && (
        <>
          <h2>Assinaturas</h2>
          {RESPONSAVEIS.map((r) => (
            <section className="grupo" key={r.id}>
              <h3>{r.titulo}</h3>
              <label className="campo">
                <span className="rotulo">Nome do Empregado</span>
                <input type="text" value={data.campos[r.nome] ?? ''} onChange={(e) => api.setCampo(r.nome, e.target.value)} />
              </label>
              <label className="campo">
                <span className="rotulo">Matrícula / CPF</span>
                <input type="text" value={data.campos[r.doc] ?? ''} onChange={(e) => api.setCampo(r.doc, e.target.value)} />
              </label>
              <SignaturePad
                label="Assinatura"
                value={data.assinaturas[r.assinatura] ?? ''}
                onChange={(url) => api.setAssinatura(r.assinatura, url)}
              />
              {r.id === 'resp' && (
                <p>
                  <button type="button" className="btn" onClick={api.mesmaPessoa}>Mesma pessoa do operador</button>
                </p>
              )}
            </section>
          ))}
          <p><small>{NOTA_ASSINATURA}</small></p>

          <div className="lembretes">
            <strong>{TITULO_LEMBRETES}</strong>
            <ul>
              {LEMBRETES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p><strong>{LEMBRETE_FINAL}</strong></p>
          </div>

          {pendentes.length > 0 ? (
            <>
              <div className="aviso">{pendentes.length} item(ns) pendente(s) (o PDF pode ser gerado assim mesmo):</div>
              <ul className="pendentes">
                {pendentes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Tudo preenchido.</p>
          )}
          {erro && <div className="aviso">{erro}</div>}
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
