import { useEffect, useRef } from 'react'

interface Props {
  label: string
  value: string
  onChange: (dataUrl: string) => void
  largura?: number
  altura?: number
  dica?: string
}

export function SignaturePad({ label, value, onChange, largura = 600, altura = 200, dica = 'Assine com o dedo ou mouse' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const ultimo = useRef('')
  const desenhando = useRef(false)

  useEffect(() => {
    if (value === ultimo.current) return
    ultimo.current = value
    const c = ref.current!
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height)
      img.src = value
    }
  }, [value])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current!
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height }
  }

  const iniciar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    desenhando.current = true
    const c = ref.current!
    const ctx = c.getContext('2d')!
    ctx.lineWidth = 3 * (c.width / 600)
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#111'
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + 0.1, p.y)
    ctx.stroke()
  }

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!desenhando.current) return
    const ctx = ref.current!.getContext('2d')!
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const terminar = () => {
    if (!desenhando.current) return
    desenhando.current = false
    const url = ref.current!.toDataURL('image/png')
    ultimo.current = url
    onChange(url)
  }

  const limpar = () => {
    const c = ref.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    ultimo.current = ''
    onChange('')
  }

  return (
    <div className="assinatura">
      <span className="rotulo">{label}</span>
      <canvas
        ref={ref}
        width={largura}
        height={altura}
        style={{ aspectRatio: `${largura}/${altura}` }}
        aria-label={label}
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
      />
      <div className="acoes">
        <small>{dica}</small>
        <button type="button" className="btn" onClick={limpar}>Limpar</button>
      </div>
    </div>
  )
}
