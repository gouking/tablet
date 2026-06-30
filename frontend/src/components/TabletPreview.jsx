const TYPE_DISPLAY = { REBIRTH: '往生蓮位', BLESSING: '祈福蓮位', SALVATION: '超度蓮位', DISASTER: '消災蓮位' }

export default function TabletPreview({ data }) {
  const { type = 'REBIRTH', name = '姓名', title = '顯', birthYear, deathYear, family, duration } = data

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex flex-col items-center justify-between rounded text-center"
        style={{
          background: '#1a0a00',
          border: '3px solid #b8860b',
          width: 160,
          minHeight: 220,
          padding: '18px 14px',
          boxShadow: 'inset 0 0 0 1.5px #3d1f00',
        }}>
        {/* Inner frame */}
        <div style={{ position: 'absolute', inset: 7, border: '0.5px solid #5a3a0a', borderRadius: 2, pointerEvents: 'none' }} />

        <div style={{ color: '#d4a017', fontSize: 10, letterSpacing: 3, fontFamily: 'serif' }}>
          {TYPE_DISPLAY[type]}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1 justify-center my-2">
          <span style={{ color: '#b8860b', fontSize: 16 }}>❀</span>
          <span style={{ color: '#d4a017', fontSize: 9, letterSpacing: 2, fontFamily: 'serif' }}>{title}</span>
          <span style={{ color: '#ffd700', fontSize: 22, fontWeight: 'bold', letterSpacing: 4, fontFamily: 'serif' }}>
            {name || '姓名'}
          </span>
          <span style={{ color: '#d4a017', fontSize: 9, letterSpacing: 1, fontFamily: 'serif' }}>
            {type === 'REBIRTH' ? '居士之蓮位' : '蓮位'}
          </span>
          {(birthYear || deathYear) && (
            <div style={{ color: '#a07030', fontSize: 8, lineHeight: 1.6, marginTop: 2 }}>
              {birthYear && <div>生：{birthYear}</div>}
              {deathYear && <div>歿：{deathYear}</div>}
            </div>
          )}
          {duration && (
            <div style={{ color: '#7a5010', fontSize: 7, marginTop: 2 }}>供奉：{duration}</div>
          )}
        </div>

        <div style={{ color: '#a07030', fontSize: 8, fontFamily: 'serif', letterSpacing: 1 }}>
          {family || '陽上款'}
        </div>
        <div style={{ color: '#5a3a0a', fontSize: 7, letterSpacing: 2, marginTop: 4 }}>南無阿彌陀佛</div>
      </div>
      <div className="text-xs text-gray-400 mt-2">預覽 · 8.5 × 12 cm</div>
    </div>
  )
}
