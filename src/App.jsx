import { useState, useEffect } from 'react'
import { database } from './firebase'
import { ref, push, set, onValue, off, remove, update, get } from 'firebase/database'
import './App.css'

// Roller ve açıklamaları
const ROLES = {
  DETECTIVE: {
    name: '🔎 Dedektif',
    description: 'Her tur sonunda ölen kişiden bir ipucu öğrenebilir. Amacı: Katili bulmak.',
    team: 'good'
  },
  SPY: {
    name: '🕵️ Casus',
    description: 'Katilin kim olduğunu bilir. Dedektife gizliden yardım eder ama belli etmeden.',
    team: 'good'
  },
  KILLER: {
    name: '🔪 Katil',
    description: 'Her gece birini öldürür. Yakalanmamaya çalışır.',
    team: 'evil'
  },
  SECURITY: {
    name: '🛡️ Güvenlik',
    description: 'Her gece bir kişiyi korur. Korunan kişi katil tarafından öldürülemez.',
    team: 'good'
  },
  INNOCENT: {
    name: '😇 Masum',
    description: 'Hiçbir özel yeteneği yoktur. Dedektife yardım etmeye çalışır.',
    team: 'good'
  },
  SHADOW: {
    name: '🌙 Gölge',
    description: 'Nötr rol. Kendi hayatta kalma amacı var. Ne iyi ne kötü takımla. Son 3 kişide kalırsa kazanır.',
    team: 'neutral'
  },
  FORENSIC: {
    name: '🔬 Adli Tıpçı',
    description: 'Gece ölen bir oyuncunun rolünü öğrenebilir. Bilgiyi gizli tutar ve sözlü yönlendirme yapar.',
    team: 'good'
  },
  PSYCHOLOGIST: {
    name: '🧠 Psikolog',
    description: 'İki oyuncu seçer ve aralarındaki güven/şüphe ilişkisini öğrenir. Sosyal dinamikleri analiz eder.',
    team: 'good'
  },
  VAMPIRE: {
    name: '🧛 Kan Emici',
    description: 'Katilin kim olduğunu bilir. Geceleri bir kişiyi hipnotize edebilir (oy gücünü çalar). Katil ölse bile bir gece daha hayatta kalabilir.',
    team: 'evil'
  },
  TWINS: {
    name: '👥 İkizler',
    description: 'Birbirlerini bilirler. Biri ölürse, diğeri bir kereye mahsus oy gücünü ikiye katlar.',
    team: 'good'
  },
  REFLECTOR: {
    name: '🪞 Yansıtıcı',
    description: 'Gece kendine gelen saldırıyı saldırgana yansıtır. Tek kullanımlık yetenek.',
    team: 'good'
  },
  MYSTERIOUS: {
    name: '🧙 Gizemli Adam',
    description: 'Her tur rol değiştirir. Rolünü kendisi bile bilmez, sistem geceleri bildirir. Nötr rol.',
    team: 'neutral'
  },
  MANIPULATOR: {
    name: '🧠 Manipülatör',
    description: 'Geceleri bir oyuncunun oyunu başka bir oyuncuya yönlendirir. Katilin kazanmasına yardım eder.',
    team: 'evil'
  },
  DECOY_KILLER: {
    name: '🦹‍♂️ Taklitçi Katil',
    description: 'Gerçek katilin kim olduğunu bilir ama rolünü taklit eder. Dikkat dağıtıp katilin hayatta kalmasını sağlar.',
    team: 'evil'
  },
  SABOTEUR: {
    name: '🔒 Sabotajcı',
    description: 'Oylama sırasında bir kişinin oyunu geçersiz yapabilir (günde 1 kez). Katil kazanırsa kazanır.',
    team: 'evil'
  },
  FAKE_DETECTIVE: {
    name: '🃏 Yalancı Dedektif',
    description: 'Dedektif gibi davranır ama yalan bilgi verir. Kendini masum gösterip doğruyu söyleyenleri ifşa eder.',
    team: 'evil'
  },
  SHADOW_GUARDIAN: {
    name: '🛡️ Gölge Koruyucu',
    description: 'Kimi koruduğunu kimse bilmez. Katil başarısız olursa sadece "biri korundu" bilgisi verilir.',
    team: 'good'
  },
  ANALYST: {
    name: '🎓 Strateji Uzmanı',
    description: 'Oy kullananların kaçının aynı kişiye oy verdiğini öğrenir. Kitlenin yönelimine göre analiz yapar.',
    team: 'good'
  },
  SURVIVOR: {
    name: '💰 Hayatta Kalan',
    description: 'Özel yeteneği yok. Oyunun sonunda hâlâ hayattaysa kazanır. Nötr rol.',
    team: 'neutral'
  },
  CHAOS_AGENT: {
    name: '🃏 Kaos Ustası',
    description: 'Her gece bir kişinin rolünü rastgele değiştirebilir (1 kez kullanılır). Hiçbir taraf kazanmazsa kazanır.',
    team: 'neutral'
  },
  ATTENTION_SEEKER: {
    name: '📯 Şöhret Avcısı',
    description: 'Özel yeteneği yok. En çok oyu alıp öldürülürse kazanır. Nötr rol.',
    team: 'neutral'
  },
  DOUBLE_AGENT: {
    name: '🐍 İkili Ajan',
    description: 'İlk tur sonunda katil mi yoksa halk mı tarafında olacağına karar verir. Seçtiği taraf kazanırsa kazanır.',
    team: 'neutral'
  },
  INTUITIVE: {
    name: '🔮 Sezici',
    description: 'Her tur sonunda rastgele bir oyuncu hakkında doğru bilgi alır (%70 doğruluk). Oyunu okuyan, tahmin yetenekli.',
    team: 'good'
  }
}

// Oyun fazları
const GAME_PHASES = {
  LOBBY: 'lobby',
  ROLE_REVEAL: 'role_reveal',
  SECURITY: 'security',
  FORENSIC: 'forensic',
  PSYCHOLOGIST: 'psychologist',
  VAMPIRE: 'vampire',
  MANIPULATOR: 'manipulator',
  SHADOW_GUARDIAN: 'shadow_guardian',
  SABOTEUR: 'saboteur',
  ANALYST: 'analyst',
  INTUITIVE: 'intuitive',
  DOUBLE_AGENT: 'double_agent',
  CHAOS_AGENT: 'chaos_agent',
  NIGHT: 'night',
  DAY: 'day',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  GAME_OVER: 'game_over',
  FINAL_GUESS: 'final_guess'
}

// Rastgele roller havuzu (Gölge temel rol olduğu için havuzda yok)
const RANDOM_ROLES_POOL = [
  'FORENSIC', 'PSYCHOLOGIST', 'VAMPIRE', 'TWINS', 'REFLECTOR', 'MYSTERIOUS',
  'MANIPULATOR', 'DECOY_KILLER', 'SABOTEUR', 'FAKE_DETECTIVE', 'SHADOW_GUARDIAN',
  'ANALYST', 'SURVIVOR', 'CHAOS_AGENT', 'ATTENTION_SEEKER', 'DOUBLE_AGENT', 'INTUITIVE'
]

// Konum sistemi
const LOCATIONS = [
  '🏠 Ev', '🍴 Mutfak', '🛏️ Yatak Odası', '🚿 Banyo', '📚 Kütüphane', 
  '🌳 Bahçe', '🚗 Garaj', '🏢 Ofis', '🛒 Market', '⛪ Kilise',
  '🏫 Okul', '🏥 Hastane', '🍺 Bar', '☕ Kafe', '🎬 Sinema'
]

// Görsel semboller sistemi
const VISUAL_SYMBOLS = [
  '👓 Gözlük', '🎩 Şapka', '👞 Siyah Ayakkabı', '⌚ Saat', '🧣 Atkı',
  '💍 Yüzük', '🎒 Çanta', '🧤 Eldiven', '👔 Takım Elbise', '👕 Tişört',
  '🕶️ Güneş Gözlüğü', '🎯 Rozet', '📱 Telefon', '🔑 Anahtar', '💼 Evrak Çantası'
]

// Gece olayları
const NIGHT_EVENTS = [
  {
    id: 'cloudy_night',
    name: '☁️ Bulutlu Gece',
    description: 'Gökyüzü kapalı, adli tıpçı çalışamıyor.',
    effect: 'disable_forensic',
    probability: 0.15
  },
  {
    id: 'panic_night',
    name: '😱 Panik Gecesi',
    description: 'Köy halkı panikte, bu tur kimse oy kullanamıyor.',
    effect: 'disable_voting',
    probability: 0.1
  },
  {
    id: 'scream_night',
    name: '😨 Çığlık Gecesi',
    description: 'Bir çığlık duyuldu, dedektif ekstra ipucu alıyor.',
    effect: 'extra_clue',
    probability: 0.12
  },
  {
    id: 'storm_night',
    name: '⛈️ Fırtınalı Gece',
    description: 'Fırtına var, psikolog konsantre olamıyor.',
    effect: 'disable_psychologist',
    probability: 0.15
  },
  {
    id: 'empathy_night',
    name: '💫 Empati Gecesi',
    description: 'Psikolog üç kişi arasındaki ilişkiyi analiz edebiliyor.',
    effect: 'psychologist_boost',
    probability: 0.07
  },
      {
    id: 'full_moon',
    name: '🌕 Dolunay',
    description: 'Dolunay etkisi, kan emici iki kişiyi hipnotize edebiliyor.',
    effect: 'vampire_boost',
    probability: 0.08
  },
  {
    id: 'guardian_night',
    name: '👼 Koruyucu Gece',
    description: 'Mistik güçler çalışıyor, herkes korunuyor.',
    effect: 'protect_all',
    probability: 0.05
  },
  {
    id: 'insight_night',
    name: '💡 İçgörü Gecesi',
    description: 'Herkes daha dikkatli, tüm roller bir ipucu alıyor.',
    effect: 'insight_boost',
    probability: 0.1
  },
  {
    id: 'chaos_night',
    name: '🌪️ Kaos Gecesi',
    description: 'Büyük karışıklık, gizemli adam iki kez rol değiştiriyor.',
    effect: 'chaos_mysterious',
    probability: 0.08
  },
  {
    id: 'manipulation_night',
    name: '🧠 Manipülasyon Gecesi',
    description: 'Zihinsel güçler artmış, manipülatör iki kişinin oyunu yönlendirebiliyor.',
    effect: 'manipulation_boost',
    probability: 0.06
  },
  {
    id: 'confusion_night',
    name: '😵 Kafa Karışıklığı Gecesi',
    description: 'Herkes kafası karışık, sabotajcı iki oyun geçersiz kılabiliyor.',
    effect: 'sabotage_boost',
    probability: 0.07
  },
  {
    id: 'shadow_night',
    name: '🌑 Gölge Gecesi',
    description: 'Karanlık güçler hakim, gölge koruyucu iki kişiyi koruyabiliyor.',
    effect: 'shadow_guardian_boost',
    probability: 0.05
  },
  {
    id: 'analysis_night',
    name: '📊 Analiz Gecesi',
    description: 'Veriler net görünüyor, strateji uzmanı detaylı analiz yapabiliyor.',
    effect: 'analyst_boost',
    probability: 0.08
  },
  {
    id: 'intuition_night',
    name: '🔮 Sezgi Gecesi',
    description: 'Psişik enerjiler yoğun, sezici %100 doğru bilgi alıyor.',
    effect: 'intuitive_boost',
    probability: 0.06
  },
  {
    id: 'deception_night',
    name: '🎭 Aldatma Gecesi',
    description: 'Yalanlar gerçek gibi görünüyor, yalancı dedektif çok ikna edici.',
    effect: 'deception_boost',
    probability: 0.07
  }
]

function App() {
  // Firebase durumları
  const [gameRoomId, setGameRoomId] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [isHost, setIsHost] = useState(false)
  
  // Oyun durumu
  const [gameData, setGameData] = useState(null)
  const [players, setPlayers] = useState([])
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.LOBBY)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [myRole, setMyRole] = useState(null)
  const [votes, setVotes] = useState({})
  const [showRules, setShowRules] = useState(false)
  const [showRoles, setShowRoles] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [firebaseConnected, setFirebaseConnected] = useState(false)
  const [protectedPlayer, setProtectedPlayer] = useState(null)
  
  // Oylama süre sistemi
  const [votingTimeLeft, setVotingTimeLeft] = useState(0)
  const [votingTimer, setVotingTimer] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  
  // Psikolog seçimleri
  const [selectedPlayer1, setSelectedPlayer1] = useState(null)
  const [selectedPlayer2, setSelectedPlayer2] = useState(null)
  
  // Gece olayı bildirimi
  const [showNightEventNotification, setShowNightEventNotification] = useState(false)
  const [nightEventMessage, setNightEventMessage] = useState('')

  // Firebase bağlantısı test et
  useEffect(() => {
    let unsubscribe = null
    
    const testConnection = async () => {
      try {
        const testRef = ref(database, '.info/connected')
        unsubscribe = onValue(testRef, (snapshot) => {
          const isConnected = snapshot.val() === true
          setFirebaseConnected(isConnected)
          if (isConnected) {
            console.log('✅ Firebase bağlantısı başarılı!')
          } else {
            console.log('❌ Firebase bağlantısı yok')
          }
        })
      } catch (error) {
        console.error('❌ Firebase bağlantı hatası:', error)
        setFirebaseConnected(false)
      }
    }
    
    testConnection()
    
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Oyun fazı değişikliklerini takip et
  useEffect(() => {
    console.log('🎭 Oyun fazı değişti:', gamePhase)
    if (gamePhase === GAME_PHASES.ROLE_REVEAL) {
      console.log('✨ Roller açıklanıyor...')
    }
  }, [gamePhase])

  // Firebase bağlantı durumunu kontrol et (sadece debug için)
  useEffect(() => {
    console.log('🔗 Firebase bağlantı durumu:', firebaseConnected)
    console.log('🎮 Oyun durumu:', { gameRoomId, playerId, isHost, gamePhase })
    if (gameData) {
      console.log('📊 Oyun verisi mevcut')
    }
  }, [firebaseConnected, gameRoomId, playerId, isHost, gamePhase])

  // Oylama süre takibi
  useEffect(() => {
    if (gameData && gameData.votingStartTime && gamePhase === GAME_PHASES.VOTING) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameData.votingStartTime) / 1000)
        const timeLeft = Math.max(0, 90 - elapsed) // 90 saniye oylama süresi
        
        setVotingTimeLeft(timeLeft)
        
        if (timeLeft === 0 && isHost) {
          // Süre doldu, oyları işle
          processVotes()
          clearInterval(timer)
        }
      }, 1000)
      
      setVotingTimer(timer)
      
      return () => {
        clearInterval(timer)
        setVotingTimer(null)
      }
    } else {
      setVotingTimeLeft(0)
      if (votingTimer) {
        clearInterval(votingTimer)
        setVotingTimer(null)
      }
    }
  }, [gameData, gamePhase, isHost])

  // Oylama fazına geçildiğinde süreyi başlat
  useEffect(() => {
    if (gamePhase === GAME_PHASES.VOTING && isHost && !gameData?.votingStartTime) {
      startVotingTimer()
    }
    
    // Oylama fazı değiştiğinde hasVoted'ı sıfırla
    if (gamePhase !== GAME_PHASES.VOTING) {
      setHasVoted(false)
    }
  }, [gamePhase, isHost, gameData?.votingStartTime])

  // Firebase bağlantısını dinle
  useEffect(() => {
    if (!gameRoomId) {
      console.log('⚠️ gameRoomId yok, Firebase dinleme başlatılmıyor')
      return
    }

    console.log('🔗 Firebase dinleme başlatılıyor...', gameRoomId)
    const gameRef = ref(database, `games/${gameRoomId}`)
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      console.log('📡 Firebase snapshot alındı:', snapshot.exists())
      const data = snapshot.val()
      console.log('📊 Firebase data mevcut:', !!data)
      
      if (data) {
        console.log('✅ gameData güncelleniyor')
        setGameData(data)
        setPlayers(Object.values(data.players || {}))
        setGamePhase(data.gamePhase || GAME_PHASES.LOBBY)
        setCurrentPlayerIndex(data.currentPlayerIndex || 0)
        setConnectionStatus('connected')
        
        // Kendi rolümü bul
        if (data.players && playerId && data.players[playerId]) {
          console.log('🎭 Rolüm bulundu:', data.players[playerId].role)
          setMyRole(data.players[playerId].role)
        }
      } else {
        console.log('❌ Firebase data yok!')
        setGameData(null)
        setConnectionStatus('game_not_found')
      }
    }, (error) => {
      console.error('❌ Firebase dinleme hatası:', error)
      setConnectionStatus('error')
    })

    return () => {
      console.log('🔌 Firebase dinleme kapatılıyor...')
      unsubscribe()
    }
  }, [gameRoomId, playerId])

  // Gece fazına geçildiğinde otomatik kontroller
  useEffect(() => {
    if (gamePhase === GAME_PHASES.NIGHT && isHost && gameData) {
      const aliveKillers = Object.values(gameData.players).filter(p => p.role === 'KILLER' && p.isAlive)
      
      // Eğer hiçbir katil kalmadıysa otomatik olarak gündüze geç
      if (aliveKillers.length === 0) {
        console.log('🌅 Hiçbir katil kalmadı, otomatik olarak gündüze geçiliyor...')
        setTimeout(() => {
          changeGamePhase(GAME_PHASES.DAY)
        }, 2000) // 2 saniye bekle ki oyuncular durumu görebilsin
        return
      }

      // Gece fazında aktif roller için bekleme sistemi
      const checkNightPhaseCompletion = () => {
        const alivePlayers = Object.values(gameData.players).filter(p => p.isAlive)
        const nightActions = gameData.nightActions || {}
        const currentTurn = gameData.turn || 1
        
        // Bu turda aksiyon alması gereken roller (sadece oyunda olanlar)
        const activeNightRoles = alivePlayers.filter(p => {
          const nightRoles = ['KILLER', 'VAMPIRE', 'MANIPULATOR', 'SABOTEUR', 'SHADOW_GUARDIAN', 'CHAOS_AGENT']
          return nightRoles.includes(p.role) && isRoleInGame(p.role)
        })
        
        // Tüm aktif roller aksiyon aldı mı kontrol et
        const allActionsCompleted = activeNightRoles.every(player => {
          const actionKey = `${player.id}_turn_${currentTurn}`
          return nightActions[actionKey] || false
        })
        
        console.log('🌙 Gece fazı kontrol:', {
          activeRoles: activeNightRoles.length,
          completedActions: Object.keys(nightActions).filter(key => key.includes(`_turn_${currentTurn}`)).length,
          allCompleted: allActionsCompleted
        })
        
        // Eğer tüm roller görevini yaptıysa gündüze geç
        if (allActionsCompleted && activeNightRoles.length > 0) {
          console.log('🌅 Tüm gece görevleri tamamlandı, gündüze geçiliyor...')
          setTimeout(() => {
            changeGamePhase(GAME_PHASES.DAY)
          }, 3000) // 3 saniye bekle ki oyuncular sonuçları görebilsin
        }
      }
      
      // 5 saniye sonra kontrol et (oyuncuların hazırlanması için)
      const checkTimer = setTimeout(checkNightPhaseCompletion, 5000)
      
      // Her 10 saniyede bir kontrol et
      const intervalTimer = setInterval(checkNightPhaseCompletion, 10000)
      
      return () => {
        clearTimeout(checkTimer)
        clearInterval(intervalTimer)
      }
    }
  }, [gamePhase, isHost, gameData])

  // Oyunda olan rolleri kontrol et
  const isRoleInGame = (role) => {
    if (!gameData || !gameData.players) return false
    return Object.values(gameData.players).some(player => player.role === role)
  }

  // Gece olayı bildirimi - herkese göster
  useEffect(() => {
    if (gameData && gameData.currentNightEvent && gamePhase === GAME_PHASES.NIGHT) {
      const eventKey = `nightEvent_${gameData.turn}_${gameData.currentNightEvent.id}`
      const shownEvents = JSON.parse(localStorage.getItem('shownNightEvents') || '[]')
      
      if (!shownEvents.includes(eventKey)) {
        setNightEventMessage(`🌙 ${gameData.currentNightEvent.name} 
${gameData.currentNightEvent.description}`)
        setShowNightEventNotification(true)
        
        // Bildirimi gösterildi olarak işaretle
        shownEvents.push(eventKey)
        localStorage.setItem('shownNightEvents', JSON.stringify(shownEvents))
        
        // 5 saniye sonra bildirimi kapat
        setTimeout(() => {
          setShowNightEventNotification(false)
        }, 5000)
      }
    }
  }, [gameData?.currentNightEvent, gamePhase, gameData?.turn])

  // Oyun kazanma durumlarını kontrol et
  useEffect(() => {
    if (gameData && isHost && gamePhase !== GAME_PHASES.LOBBY && gamePhase !== GAME_PHASES.ROLE_REVEAL) {
      const alivePlayers = Object.values(gameData.players).filter(p => p.isAlive)
      const aliveKillers = alivePlayers.filter(p => p.role === 'KILLER')
      const aliveGoodTeam = alivePlayers.filter(p => 
        ['DETECTIVE', 'SPY', 'SECURITY', 'INNOCENT', 'FORENSIC', 'PSYCHOLOGIST', 'TWINS', 'REFLECTOR', 'SHADOW_GUARDIAN', 'ANALYST', 'INTUITIVE'].includes(p.role)
      )
      const aliveEvilTeam = alivePlayers.filter(p => 
        ['KILLER', 'VAMPIRE', 'MANIPULATOR', 'DECOY_KILLER', 'SABOTEUR', 'FAKE_DETECTIVE'].includes(p.role)
      )
      
      // Katiller kazandı (iyi takım ≤ kötü takım)
      if (aliveKillers.length > 0 && aliveGoodTeam.length <= aliveEvilTeam.length) {
        console.log('💀 Katiller kazandı!')
        changeGamePhase(GAME_PHASES.GAME_OVER)
      }
      // İyi takım kazandı (hiç katil kalmadı)
      else if (aliveKillers.length === 0 && aliveGoodTeam.length > 0) {
        console.log('👮 İyi takım kazandı!')
        changeGamePhase(GAME_PHASES.GAME_OVER)
      }
    }
  }, [gameData, isHost, gamePhase])

  // Gizemli Adam rol bildirimi (her tur başlangıcında)
  useEffect(() => {
    if (gameData && myRole === 'MYSTERIOUS' && gamePhase === GAME_PHASES.DAY && gameData.turn) {
      const currentTurn = gameData.turn
      const lastNotifiedTurn = localStorage.getItem(`mysterious_notified_turn_${gameRoomId}`)
      
      if (lastNotifiedTurn !== currentTurn.toString()) {
        const mysteriousPlayer = gameData.players[playerId]
        if (mysteriousPlayer && mysteriousPlayer.isAlive && mysteriousPlayer.currentRole) {
          setTimeout(() => {
            alert(`🎭 Gizemli Adam - Tur ${currentTurn}\n\nBu tur rolünüz: ${ROLES[mysteriousPlayer.currentRole]?.name}\n\nAçıklama: ${ROLES[mysteriousPlayer.currentRole]?.description}`)
            localStorage.setItem(`mysterious_notified_turn_${gameRoomId}`, currentTurn.toString())
          }, 1000)
        }
      }
    }
  }, [gameData, myRole, gamePhase, gameRoomId, playerId])

  // Gece olayı bildirimi (gece fazına geçildiğinde)
  useEffect(() => {
    if (gameData && gamePhase === GAME_PHASES.NIGHT && gameData.currentNightEvent) {
      const eventId = gameData.currentNightEvent.id
      const turn = gameData.turn || 1
      const lastNotifiedEvent = localStorage.getItem(`night_event_notified_${gameRoomId}_${turn}`)
      
      if (lastNotifiedEvent !== eventId) {
        setTimeout(() => {
          const event = gameData.currentNightEvent
          if (event.id === 'normal_night') {
            alert(`🌙 Normal Gece - Tur ${turn}\n\nBu gece özel bir olay yok. Herkes normal görevlerini yapabilir.`)
          } else {
            alert(`${event.name.split(' ')[0]} ${event.name} - Tur ${turn}\n\n${event.description}\n\nBu özel gece etkisini göz önünde bulundurarak hareket edin!`)
          }
          localStorage.setItem(`night_event_notified_${gameRoomId}_${turn}`, eventId)
        }, 1500)
      }
    }
  }, [gameData, gamePhase, gameRoomId])

  // Oyun odası oluştur
  // Oda kodu oluşturucu fonksiyonu (5-6 haneli, harf ve sayı karışımı)
  const generateRoomCode = () => {
    // Karışabilecek karakterleri çıkar (0, O, 1, I)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const length = Math.random() < 0.5 ? 5 : 6 // %50 ihtimalle 5 veya 6 haneli
    let result = ''
    
    // İlk karakter harf olsun
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    result += letters.charAt(Math.floor(Math.random() * letters.length))
    
    // Geri kalan karakterler karışık
    for (let i = 1; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  }

  const createGameRoom = async () => {
    console.log('🏠 Oyun odası oluşturuluyor...')
    
    if (!playerName.trim()) {
      alert('Lütfen isminizi girin!')
      return
    }

    try {
      // Özel oda kodu oluştur
      const roomId = generateRoomCode()
      console.log('🎲 Oda kodu oluşturuldu:', roomId)
      
      // Oda kodunun benzersiz olduğundan emin ol
      const gameRef = ref(database, `games/${roomId}`)
      const snapshot = await get(gameRef)
      
      if (snapshot.exists()) {
        console.log('⚠️ Oda kodu zaten var, yeni kod oluşturuluyor...')
        // Eğer oda kodu zaten varsa, yeni bir tane oluştur
        return createGameRoom()
      }
      
      const newPlayerId = `player_${Date.now()}`
      console.log('👤 Oyuncu ID oluşturuldu:', newPlayerId)
      
      const gameData = {
        gamePhase: GAME_PHASES.LOBBY,
        hostId: newPlayerId,
        createdAt: Date.now(),
        players: {
          [newPlayerId]: {
            id: newPlayerId,
            name: playerName,
            isHost: true,
            joinedAt: Date.now(),
            isAlive: true
          }
        }
      }

      console.log('💾 Firebase\'e veri yazılıyor...', gameData)
      await set(gameRef, gameData)
      
      setGameRoomId(roomId)
      setPlayerId(newPlayerId)
      setIsHost(true)
      setConnectionStatus('connected')
      
      // Başarı mesajı göster
      console.log(`✅ Oyun odası başarıyla oluşturuldu! Oda kodu: ${roomId}`)
    } catch (error) {
      console.error('❌ Oyun odası oluşturulurken hata:', error)
      alert('Oyun odası oluşturulamadı!')
    }
  }

  // Oyun odasına katıl
  const joinGameRoom = async (roomId) => {
    if (!playerName.trim()) {
      alert('Lütfen isminizi girin!')
      return
    }

    if (!roomId.trim()) {
      alert('Lütfen oda kodunu girin!')
      return
    }

    try {
      // Oda kodunu büyük harfe çevir (case-insensitive)
      const normalizedRoomId = roomId.trim().toUpperCase()
      const gameRef = ref(database, `games/${normalizedRoomId}`)
      const newPlayerId = `player_${Date.now()}`
      
      // Odanın var olup olmadığını kontrol et
      const snapshot = await get(gameRef)
      if (!snapshot.exists()) {
        alert('Oda bulunamadı! Lütfen oda kodunu kontrol edin.')
        return
      }
      
      // Oyuncu ekle
      const playerRef = ref(database, `games/${normalizedRoomId}/players/${newPlayerId}`)
      await set(playerRef, {
        id: newPlayerId,
        name: playerName,
        isHost: false,
        joinedAt: Date.now(),
        isAlive: true
      })

      setGameRoomId(normalizedRoomId)
      setPlayerId(newPlayerId)
      setIsHost(false)
      setConnectionStatus('connected')
      
      // Başarı mesajı göster
      console.log(`✅ Odaya katıldınız! Oda kodu: ${normalizedRoomId}`)
    } catch (error) {
      console.error('Oyuna katılırken hata:', error)
      alert('Oyuna katılamadı!')
    }
  }

  // Oyunu başlat (sadece host)
  const startGame = async () => {
    console.log('🎮 Oyun başlatılmaya çalışılıyor...')
    console.log('Host kontrolü:', { isHost, gameRoomId, playerId })
    console.log('gameData durumu:', gameData)
    
    if (!isHost || !gameRoomId) {
      console.log('❌ Host değil veya oda ID yok:', { isHost, gameRoomId })
      return
    }

    if (!gameData || !gameData.players) {
      console.log('❌ gameData veya players yok:', gameData)
      alert('Oyun verisi yüklenemedi! Sayfayı yenileyin.')
      return
    }

    const playerList = Object.values(gameData.players)
    const playerCount = playerList.length
    
    console.log('👥 Oyuncu bilgileri:', { playerCount, playerList })
    
    if (playerCount < 6) {
      console.log('❌ Yetersiz oyuncu:', playerCount)
      alert('En az 6 oyuncu gerekli!')
      return
    }
    
    if (playerCount > 12) {
      console.log('❌ Çok fazla oyuncu:', playerCount)
      alert('En fazla 12 oyuncu olabilir!')
      return
    }

    console.log('✅ Oyun başlatılıyor, roller dağıtılıyor...')

    try {
      // Temel roller (her oyunda olacak)
      let killerCount, spyCount = 1, detectiveCount = 1, securityCount = 0, innocentCount, shadowCount
      
      // Oyuncu sayısına göre temel rol dağılımı
      if (playerCount === 6) {
        killerCount = 1
        securityCount = 1
        innocentCount = 0
        shadowCount = 2
      } else if (playerCount >= 7 && playerCount <= 8) {
        killerCount = 1
        securityCount = 1
        innocentCount = 0
        shadowCount = playerCount - 4
      } else if (playerCount >= 9 && playerCount <= 10) {
        killerCount = 2
        securityCount = 1
        innocentCount = 0
        shadowCount = playerCount - 5
      } else if (playerCount >= 11 && playerCount <= 12) {
        killerCount = 2
        securityCount = 1
        innocentCount = 0
        shadowCount = playerCount - 5
      } else { // 13+
        killerCount = 3
        securityCount = 1
        innocentCount = 0
        shadowCount = playerCount - 5
      }

      // Rastgele roller havuzu - her oyunda 2-3 ekstra rol
      const extraRoleCount = Math.min(3, Math.max(2, Math.floor(playerCount / 4)))
      const shuffledRandomRoles = [...RANDOM_ROLES_POOL].sort(() => Math.random() - 0.5)
      const selectedRandomRoles = shuffledRandomRoles.slice(0, extraRoleCount)
      
      // Seçilen rolleri say
      let forensicCount = 0, psychologistCount = 0, vampireCount = 0, 
          twinsCount = 0, reflectorCount = 0, mysteriousCount = 0,
          manipulatorCount = 0, decoyKillerCount = 0, saboteurCount = 0,
          fakeDetectiveCount = 0, shadowGuardianCount = 0, analystCount = 0,
          survivorCount = 0, chaosAgentCount = 0, attentionSeekerCount = 0,
          doubleAgentCount = 0, intuitiveCount = 0
      
      selectedRandomRoles.forEach(role => {
        switch(role) {
          case 'FORENSIC': forensicCount = 1; break
          case 'PSYCHOLOGIST': psychologistCount = 1; break
          case 'VAMPIRE': vampireCount = 1; break
          case 'TWINS': twinsCount = 2; break // İkizler çift gelir
          case 'REFLECTOR': reflectorCount = 1; break
          case 'MYSTERIOUS': mysteriousCount = 1; break
          case 'MANIPULATOR': manipulatorCount = 1; break
          case 'DECOY_KILLER': decoyKillerCount = 1; break
          case 'SABOTEUR': saboteurCount = 1; break
          case 'FAKE_DETECTIVE': fakeDetectiveCount = 1; break
          case 'SHADOW_GUARDIAN': shadowGuardianCount = 1; break
          case 'ANALYST': analystCount = 1; break
          case 'SURVIVOR': survivorCount = 1; break
          case 'CHAOS_AGENT': chaosAgentCount = 1; break
          case 'ATTENTION_SEEKER': attentionSeekerCount = 1; break
          case 'DOUBLE_AGENT': doubleAgentCount = 1; break
          case 'INTUITIVE': intuitiveCount = 1; break
        }
      })
      
      // Ekstra rollerin yerini gölgelerden al
      const totalExtraRoles = forensicCount + psychologistCount + vampireCount + twinsCount + reflectorCount + mysteriousCount +
                             manipulatorCount + decoyKillerCount + saboteurCount + fakeDetectiveCount + shadowGuardianCount +
                             analystCount + survivorCount + chaosAgentCount + attentionSeekerCount + doubleAgentCount + intuitiveCount
      shadowCount = Math.max(0, shadowCount - totalExtraRoles)

      // Rolleri oluştur
      const roles = []
      for (let i = 0; i < killerCount; i++) roles.push('KILLER')
      for (let i = 0; i < spyCount; i++) roles.push('SPY')
      for (let i = 0; i < detectiveCount; i++) roles.push('DETECTIVE')
      for (let i = 0; i < securityCount; i++) roles.push('SECURITY')
      for (let i = 0; i < forensicCount; i++) roles.push('FORENSIC')
      for (let i = 0; i < psychologistCount; i++) roles.push('PSYCHOLOGIST')
      for (let i = 0; i < vampireCount; i++) roles.push('VAMPIRE')
      for (let i = 0; i < twinsCount; i++) roles.push('TWINS')
      for (let i = 0; i < reflectorCount; i++) roles.push('REFLECTOR')
      for (let i = 0; i < mysteriousCount; i++) roles.push('MYSTERIOUS')
      for (let i = 0; i < manipulatorCount; i++) roles.push('MANIPULATOR')
      for (let i = 0; i < decoyKillerCount; i++) roles.push('DECOY_KILLER')
      for (let i = 0; i < saboteurCount; i++) roles.push('SABOTEUR')
      for (let i = 0; i < fakeDetectiveCount; i++) roles.push('FAKE_DETECTIVE')
      for (let i = 0; i < shadowGuardianCount; i++) roles.push('SHADOW_GUARDIAN')
      for (let i = 0; i < analystCount; i++) roles.push('ANALYST')
      for (let i = 0; i < survivorCount; i++) roles.push('SURVIVOR')
      for (let i = 0; i < chaosAgentCount; i++) roles.push('CHAOS_AGENT')
      for (let i = 0; i < attentionSeekerCount; i++) roles.push('ATTENTION_SEEKER')
      for (let i = 0; i < doubleAgentCount; i++) roles.push('DOUBLE_AGENT')
      for (let i = 0; i < intuitiveCount; i++) roles.push('INTUITIVE')
      for (let i = 0; i < innocentCount; i++) roles.push('INNOCENT')
      for (let i = 0; i < shadowCount; i++) roles.push('SHADOW')

      // Rol sayısı kontrolü
      console.log('🎭 Rol dağılımı:', {
        killerCount, spyCount, detectiveCount, securityCount, 
        forensicCount, psychologistCount, vampireCount, twinsCount,
        reflectorCount, mysteriousCount, manipulatorCount, decoyKillerCount,
        saboteurCount, fakeDetectiveCount, shadowGuardianCount, analystCount,
        survivorCount, chaosAgentCount, attentionSeekerCount, doubleAgentCount,
        intuitiveCount, innocentCount, shadowCount,
        totalRoles: roles.length, playerCount
      })

      if (roles.length !== playerCount) {
        alert(`Hata: Rol sayısı (${roles.length}) oyuncu sayısına (${playerCount}) eşit değil!`)
        return
      }

      // Oyuncuları karıştır ve rolleri ata
      const shuffledPlayers = [...playerList].sort(() => Math.random() - 0.5)
      const shuffledRoles = [...roles].sort(() => Math.random() - 0.5)
      
      // Konumları ve sembolleri karıştır
      const shuffledLocations = [...LOCATIONS].sort(() => Math.random() - 0.5)
      const shuffledSymbols = [...VISUAL_SYMBOLS].sort(() => Math.random() - 0.5)

      const playersWithRoles = {}
      let twinIds = [] // İkizlerin ID'leri
      
      shuffledPlayers.forEach((player, index) => {
        const role = shuffledRoles[index]
        const playerData = {
          ...player,
          role: role,
          isAlive: true,
          // Konum ve sembol sistemi
          location: shuffledLocations[index % shuffledLocations.length],
          visualSymbol: shuffledSymbols[index % shuffledSymbols.length],
          // Yeni roller için özel özellikler (sadece gerekli olanlar)
          doubleVoteUsed: false, // İkizler için
          manipulatedVotes: [], // Manipülatör için
          protectedPlayers: [], // Gölge koruyucu için
          votesNullified: [] // Sabotajcı için
        }

        // Rol-spesifik özellikler (sadece gerekli olanlara ekle)
        if (role === 'REFLECTOR') {
          playerData.reflectorUsed = false
        }
        if (role === 'VAMPIRE') {
          playerData.vampireExtraLife = false
        }
        if (role === 'MYSTERIOUS') {
          playerData.mysteriousCurrentRole = 'INNOCENT' // Başlangıçta masum
        }
        if (role === 'SABOTEUR') {
          playerData.sabotageUsed = false
        }
        if (role === 'CHAOS_AGENT') {
          playerData.chaosUsed = false
        }
        if (role === 'DOUBLE_AGENT') {
          playerData.doubleAgentChoice = null // 'good' veya 'evil'
        }

        playersWithRoles[player.id] = playerData
        
        // İkizleri kaydet
        if (role === 'TWINS') {
          twinIds.push(player.id)
        }
      })
      
      // İkizleri birbirine bağla
      if (twinIds.length === 2) {
        playersWithRoles[twinIds[0]].twinId = twinIds[1]
        playersWithRoles[twinIds[1]].twinId = twinIds[0]
      }

      // Oyun durumunu güncelle
      const gameRef = ref(database, `games/${gameRoomId}`)
      console.log('📝 Firebase güncelleme yapılıyor...', {
        gamePhase: GAME_PHASES.ROLE_REVEAL,
        playerCount: Object.keys(playersWithRoles).length,
        turn: 1
      })
      
      await update(gameRef, {
        gamePhase: GAME_PHASES.ROLE_REVEAL,
        players: playersWithRoles,
        currentPlayerIndex: 0,
        turn: 1,
        startedAt: Date.now(),
        killerCount,
        maxPlayers: playerCount,
        // Rastgele roller havuzu bilgisi
        activeRandomRoles: selectedRandomRoles,
        // Gece olayları sistemi
        nightEvents: [],
        currentNightEvent: null,
        // Oylama ve oyun durumu
        votes: {},
        protectedPlayer: null,
        votingStartTime: null
      })
      
      console.log('✅ Firebase güncelleme tamamlandı! Oyun ROLE_REVEAL fazına geçti.')
    } catch (error) {
      console.error('❌ Oyun başlatılırken hata:', error)
      alert('Oyun başlatılamadı! Lütfen tekrar deneyin.')
    }
  }

  // Sonraki oyuncuya geç (rol açıklama)
  const nextPlayerRole = async () => {
    if (!isHost) return

    const playerCount = Object.keys(gameData.players).length
    if (currentPlayerIndex < playerCount - 1) {
      const gameRef = ref(database, `games/${gameRoomId}`)
      await update(gameRef, {
        currentPlayerIndex: currentPlayerIndex + 1
      })
    } else {
      // Sırasıyla fazlara geç
      console.log('🎮 Rol açıklama tamamlandı, sonraki faza geçiliyor...')
      const gameRef = ref(database, `games/${gameRoomId}`)
      const hasSecurity = Object.values(gameData.players).some(p => p.role === 'SECURITY' && p.isAlive)
      const hasForensic = Object.values(gameData.players).some(p => p.role === 'FORENSIC' && p.isAlive)
      const hasPsychologist = Object.values(gameData.players).some(p => p.role === 'PSYCHOLOGIST' && p.isAlive)
      
      console.log('🔍 Rol kontrolleri:', { hasSecurity, hasForensic, hasPsychologist, turn: gameData.turn })
      
      if (hasSecurity) {
        await update(gameRef, { gamePhase: GAME_PHASES.SECURITY })
      } else if (hasForensic && gameData.turn > 1) { // İlk turda ölen yok
        await update(gameRef, { gamePhase: GAME_PHASES.FORENSIC })
      } else if (hasPsychologist) {
        await update(gameRef, { gamePhase: GAME_PHASES.PSYCHOLOGIST })
      } else {
        const hasVampire = Object.values(gameData.players).some(p => p.role === 'VAMPIRE' && p.isAlive)
        const hasManipulator = Object.values(gameData.players).some(p => p.role === 'MANIPULATOR' && p.isAlive)
        const hasShadowGuardian = Object.values(gameData.players).some(p => p.role === 'SHADOW_GUARDIAN' && p.isAlive)
        const hasSaboteur = Object.values(gameData.players).some(p => p.role === 'SABOTEUR' && p.isAlive)
        const hasAnalyst = Object.values(gameData.players).some(p => p.role === 'ANALYST' && p.isAlive)
        const hasIntuitive = Object.values(gameData.players).some(p => p.role === 'INTUITIVE' && p.isAlive)
        const hasDoubleAgent = Object.values(gameData.players).some(p => p.role === 'DOUBLE_AGENT' && p.isAlive)
        const hasChaosAgent = Object.values(gameData.players).some(p => p.role === 'CHAOS_AGENT' && p.isAlive)
        
        if (hasVampire) {
          await update(gameRef, { gamePhase: GAME_PHASES.VAMPIRE })
        } else if (hasManipulator) {
          await update(gameRef, { gamePhase: GAME_PHASES.MANIPULATOR })
        } else if (hasShadowGuardian) {
          await update(gameRef, { gamePhase: GAME_PHASES.SHADOW_GUARDIAN })
        } else if (hasSaboteur) {
          await update(gameRef, { gamePhase: GAME_PHASES.SABOTEUR })
        } else if (hasAnalyst) {
          await update(gameRef, { gamePhase: GAME_PHASES.ANALYST })
        } else if (hasIntuitive) {
          await update(gameRef, { gamePhase: GAME_PHASES.INTUITIVE })
        } else if (hasDoubleAgent && gameData.turn === 1) {
          await update(gameRef, { gamePhase: GAME_PHASES.DOUBLE_AGENT })
        } else if (hasChaosAgent) {
          await update(gameRef, { gamePhase: GAME_PHASES.CHAOS_AGENT })
        } else {
          console.log('🌙 Gece fazına geçiliyor...')
          await update(gameRef, { gamePhase: GAME_PHASES.NIGHT })
        }
      }
    }
  }

  // Oyuncu koru (sadece güvenlik)
  const protectPlayer = async (targetId) => {
    if (myRole !== 'SECURITY' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const hasForensic = Object.values(gameData.players).some(p => p.role === 'FORENSIC' && p.isAlive)
    const hasPsychologist = Object.values(gameData.players).some(p => p.role === 'PSYCHOLOGIST' && p.isAlive)
    const hasVampire = Object.values(gameData.players).some(p => p.role === 'VAMPIRE' && p.isAlive)
    const hasManipulator = Object.values(gameData.players).some(p => p.role === 'MANIPULATOR' && p.isAlive)
    const hasShadowGuardian = Object.values(gameData.players).some(p => p.role === 'SHADOW_GUARDIAN' && p.isAlive)
    const hasSaboteur = Object.values(gameData.players).some(p => p.role === 'SABOTEUR' && p.isAlive)
    const hasAnalyst = Object.values(gameData.players).some(p => p.role === 'ANALYST' && p.isAlive)
    const hasIntuitive = Object.values(gameData.players).some(p => p.role === 'INTUITIVE' && p.isAlive)
    const hasDoubleAgent = Object.values(gameData.players).some(p => p.role === 'DOUBLE_AGENT' && p.isAlive)
    const hasChaosAgent = Object.values(gameData.players).some(p => p.role === 'CHAOS_AGENT' && p.isAlive)
    
    let nextPhase = GAME_PHASES.NIGHT
    if (hasForensic && gameData.turn > 1) {
      nextPhase = GAME_PHASES.FORENSIC
    } else if (hasPsychologist) {
      nextPhase = GAME_PHASES.PSYCHOLOGIST
    } else if (hasVampire) {
      nextPhase = GAME_PHASES.VAMPIRE
    } else if (hasManipulator) {
      nextPhase = GAME_PHASES.MANIPULATOR
    } else if (hasShadowGuardian) {
      nextPhase = GAME_PHASES.SHADOW_GUARDIAN
    } else if (hasSaboteur) {
      nextPhase = GAME_PHASES.SABOTEUR
    } else if (hasAnalyst) {
      nextPhase = GAME_PHASES.ANALYST
    } else if (hasIntuitive) {
      nextPhase = GAME_PHASES.INTUITIVE
    } else if (hasDoubleAgent && gameData.turn === 1) {
      nextPhase = GAME_PHASES.DOUBLE_AGENT
    } else if (hasChaosAgent) {
      nextPhase = GAME_PHASES.CHAOS_AGENT
    }
    
    await update(gameRef, {
      protectedPlayer: targetId,
      gamePhase: nextPhase
    })
  }

  // Gece olayı etkisini kontrol et
  const isRoleDisabledByEvent = (role) => {
    const currentEvent = gameData.currentNightEvent
    if (!currentEvent) return false
    
    switch (currentEvent.effect) {
      case 'disable_forensic':
        return role === 'FORENSIC'
      case 'disable_psychologist':
        return role === 'PSYCHOLOGIST'
      case 'protect_all':
        return role === 'KILLER' // Katiller öldüremez
      default:
        return false
    }
  }

  // Adli Tıpçı - Ölen oyuncunun rolünü öğren
  const investigateDeadPlayer = async (deadPlayerId) => {
    if (myRole !== 'FORENSIC' || !gameRoomId) return
    
    // Gece olayı kontrolü
    if (isRoleDisabledByEvent('FORENSIC')) {
      alert('☁️ Bulutlu gece nedeniyle adli tıp çalışamıyor!')
      return
    }

    const deadPlayer = gameData.players[deadPlayerId]
    if (!deadPlayer) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const hasPsychologist = Object.values(gameData.players).some(p => p.role === 'PSYCHOLOGIST' && p.isAlive)
    const hasVampire = Object.values(gameData.players).some(p => p.role === 'VAMPIRE' && p.isAlive)
    
    // Adli tıpçının özel bilgilerini kaydet
    const forensicInfoRef = ref(database, `games/${gameRoomId}/forensicInfo/${playerId}`)
    await push(forensicInfoRef, {
      turn: gameData.turn,
      deadPlayer: deadPlayer.name,
      role: deadPlayer.role,
      investigatedAt: Date.now()
    })

    let nextPhase = GAME_PHASES.NIGHT
    if (hasPsychologist) {
      nextPhase = GAME_PHASES.PSYCHOLOGIST
    } else if (hasVampire) {
      nextPhase = GAME_PHASES.VAMPIRE
    } else {
      // Diğer gece fazlarını kontrol et
      const hasManipulator = Object.values(gameData.players).some(p => p.role === 'MANIPULATOR' && p.isAlive)
      const hasShadowGuardian = Object.values(gameData.players).some(p => p.role === 'SHADOW_GUARDIAN' && p.isAlive)
      const hasSaboteur = Object.values(gameData.players).some(p => p.role === 'SABOTEUR' && p.isAlive)
      const hasAnalyst = Object.values(gameData.players).some(p => p.role === 'ANALYST' && p.isAlive)
      const hasIntuitive = Object.values(gameData.players).some(p => p.role === 'INTUITIVE' && p.isAlive)
      const hasDoubleAgent = Object.values(gameData.players).some(p => p.role === 'DOUBLE_AGENT' && p.isAlive)
      const hasChaosAgent = Object.values(gameData.players).some(p => p.role === 'CHAOS_AGENT' && p.isAlive)
      
      if (hasManipulator) {
        nextPhase = GAME_PHASES.MANIPULATOR
      } else if (hasShadowGuardian) {
        nextPhase = GAME_PHASES.SHADOW_GUARDIAN
      } else if (hasSaboteur) {
        nextPhase = GAME_PHASES.SABOTEUR
      } else if (hasAnalyst) {
        nextPhase = GAME_PHASES.ANALYST
      } else if (hasIntuitive) {
        nextPhase = GAME_PHASES.INTUITIVE
      } else if (hasDoubleAgent && gameData.turn === 1) {
        nextPhase = GAME_PHASES.DOUBLE_AGENT
      } else if (hasChaosAgent) {
        nextPhase = GAME_PHASES.CHAOS_AGENT
      }
    }

    await update(gameRef, {
      gamePhase: nextPhase
    })
  }

  // Psikolog - İlişki analizi yap
  const analyzeRelationship = async (player1Id, player2Id) => {
    if (myRole !== 'PSYCHOLOGIST' || !gameRoomId) return
    
    // Gece olayı kontrolü
    if (isRoleDisabledByEvent('PSYCHOLOGIST')) {
      alert('⛈️ Fırtınalı gece nedeniyle konsantre olamıyorsunuz!')
      return
    }

    const player1 = gameData.players[player1Id]
    const player2 = gameData.players[player2Id]
    if (!player1 || !player2) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    
    // İlişki analizi - rollere göre güven/şüphe durumu
    let relationshipResult = ''
    
    // Aynı takımdan mı kontrol et
    const sameTeam = ROLES[player1.role].team === ROLES[player2.role].team
    
    if (sameTeam) {
      // Aynı takım - güven ilişkisi
      if (player1.role === 'KILLER' && player2.role === 'VAMPIRE') {
        relationshipResult = `${player1.name} ve ${player2.name} arasında güçlü bir bağ var. Birbirlerini destekliyorlar.`
      } else if (player1.role === 'TWINS' || player2.role === 'TWINS') {
        relationshipResult = `${player1.name} ve ${player2.name} arasında özel bir bağ hissediyorum. Kan bağı olabilir.`
      } else if (['DETECTIVE', 'SPY'].includes(player1.role) && ['DETECTIVE', 'SPY'].includes(player2.role)) {
        relationshipResult = `${player1.name} ve ${player2.name} arasında karşılıklı güven var. Ortak amaçları var.`
      } else {
        relationshipResult = `${player1.name} ve ${player2.name} birbirlerine güveniyor. Aynı tarafta görünüyorlar.`
      }
    } else {
      // Farklı takım - şüphe/düşmanlık
      if ((player1.role === 'KILLER' || player1.role === 'VAMPIRE') && player2.role === 'DETECTIVE') {
        relationshipResult = `${player1.name}, ${player2.name}'den çok korkuyor. Büyük bir tehdit olarak görüyor.`
      } else if (player1.role === 'DETECTIVE' && (player2.role === 'KILLER' || player2.role === 'VAMPIRE')) {
        relationshipResult = `${player1.name}, ${player2.name}'i çok şüpheli buluyor. Güçlü bir sezgi var.`
      } else if (player1.role === 'SPY' && (player2.role === 'KILLER' || player2.role === 'VAMPIRE')) {
        relationshipResult = `${player1.name}, ${player2.name}'in gerçek yüzünü biliyor ama belli etmeye çalışıyor.`
      } else {
        relationshipResult = `${player1.name} ve ${player2.name} arasında gerginlik var. Birbirlerinden şüpheleniyorlar.`
      }
    }
    
    // Empati gecesi kontrolü - 3 kişilik analiz
    const isEmpathyNight = gameData.currentNightEvent?.id === 'empathy_night'
    
    // Psikolog bilgilerini kaydet
    const psychologistInfoRef = ref(database, `games/${gameRoomId}/psychologistInfo/${playerId}`)
    await push(psychologistInfoRef, {
      turn: gameData.turn,
      player1: player1.name,
      player2: player2.name,
      relationship: relationshipResult,
      analysisType: isEmpathyNight ? 'enhanced' : 'normal',
      analyzedAt: Date.now()
    })

    await update(gameRef, {
      gamePhase: GAME_PHASES.VAMPIRE
    })
  }

  // Oyuncu hipnotize et (kan emici)
  const hypnotizePlayer = async (targetId) => {
    if (myRole !== 'VAMPIRE' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const currentTurn = gameData.turn || 1
    const targetPlayer = gameData.players[targetId]
    
    // Gece aksiyonunu kaydet
    const nightActionKey = `${playerId}_turn_${currentTurn}`
    const nightActionRef = ref(database, `games/${gameRoomId}/nightActions/${nightActionKey}`)
    await set(nightActionRef, {
      playerId,
      role: 'VAMPIRE',
      action: 'hypnotize',
      targetId,
      turn: currentTurn,
      timestamp: Date.now()
    })
    
    // Hipnotize edilmiş oyuncuları kaydet
    const currentHypnotized = gameData.hypnotizedPlayers || []
    
    // Dolunay etkisi kontrolü - iki kişi hipnotize edebilir
    const isFullMoon = gameData.currentNightEvent?.id === 'full_moon'
    const maxHypnotize = isFullMoon ? 2 : 1
    
    if (currentHypnotized.filter(h => h.turn === gameData.turn).length >= maxHypnotize) {
      alert(`Bu gece en fazla ${maxHypnotize} kişiyi hipnotize edebilirsiniz!`)
      return
    }
    
    // Hedefi hipnotize et
    const newHypnotized = [...currentHypnotized, {
      playerId: targetId,
      playerName: targetPlayer.name,
      vampireId: playerId,
      turn: gameData.turn,
      hypnotizedAt: Date.now()
    }]
    
    await update(gameRef, {
      hypnotizedPlayers: newHypnotized,
      gamePhase: GAME_PHASES.MANIPULATOR
    })
  }

  // Manipülatör - Oyuncunun oyunu yönlendir
  const manipulateVote = async (targetId, redirectToId) => {
    if (myRole !== 'MANIPULATOR' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const currentTurn = gameData.turn || 1
    const targetPlayer = gameData.players[targetId]
    const redirectPlayer = gameData.players[redirectToId]
    
    // Gece aksiyonunu kaydet
    const nightActionKey = `${playerId}_turn_${currentTurn}`
    const nightActionRef = ref(database, `games/${gameRoomId}/nightActions/${nightActionKey}`)
    await set(nightActionRef, {
      playerId,
      role: 'MANIPULATOR',
      action: 'manipulate',
      targetId,
      redirectToId,
      turn: currentTurn,
      timestamp: Date.now()
    })
    
    // Manipülasyon gecesi etkisi - iki kişi manipüle edebilir
    const isManipulationNight = gameData.currentNightEvent?.id === 'manipulation_night'
    const maxManipulate = isManipulationNight ? 2 : 1
    
    const currentManipulated = gameData.manipulatedVotes || []
    if (currentManipulated.filter(m => m.turn === gameData.turn).length >= maxManipulate) {
      alert(`Bu gece en fazla ${maxManipulate} kişinin oyunu yönlendirebilirsiniz!`)
      return
    }
    
    const newManipulated = [...currentManipulated, {
      targetId: targetId,
      targetName: targetPlayer.name,
      redirectToId: redirectToId,
      redirectToName: redirectPlayer.name,
      manipulatorId: playerId,
      turn: gameData.turn,
      manipulatedAt: Date.now()
    }]

    await update(gameRef, {
      manipulatedVotes: newManipulated,
      gamePhase: GAME_PHASES.SHADOW_GUARDIAN
    })
  }

  // Gölge Koruyucu - Gizli koruma
  const shadowProtect = async (targetId) => {
    if (myRole !== 'SHADOW_GUARDIAN' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const currentTurn = gameData.turn || 1
    const targetPlayer = gameData.players[targetId]
    
    // Gece aksiyonunu kaydet
    const nightActionKey = `${playerId}_turn_${currentTurn}`
    const nightActionRef = ref(database, `games/${gameRoomId}/nightActions/${nightActionKey}`)
    await set(nightActionRef, {
      playerId,
      role: 'SHADOW_GUARDIAN',
      action: 'protect',
      targetId,
      turn: currentTurn,
      timestamp: Date.now()
    })
    
    // Gölge gecesi etkisi - iki kişi koruyabilir
    const isShadowNight = gameData.currentNightEvent?.id === 'shadow_night'
    const maxProtect = isShadowNight ? 2 : 1
    
    const currentProtected = gameData.shadowProtected || []
    if (currentProtected.filter(p => p.turn === gameData.turn).length >= maxProtect) {
      alert(`Bu gece en fazla ${maxProtect} kişiyi koruyabilirsiniz!`)
      return
    }
    
    const newProtected = [...currentProtected, {
      playerId: targetId,
      playerName: targetPlayer.name,
      guardianId: playerId,
      turn: gameData.turn,
      protectedAt: Date.now()
    }]

    await update(gameRef, {
      shadowProtected: newProtected,
      gamePhase: GAME_PHASES.SABOTEUR
    })
  }

  // Sabotajcı - Oyları geçersiz kıl
  const sabotageVote = async (targetId) => {
    if (myRole !== 'SABOTEUR' || !gameRoomId) return
    if (gameData.players[playerId].sabotageUsed) {
      alert('Sabotaj gücünüzü bu oyunda zaten kullandınız!')
      return
    }

    const gameRef = ref(database, `games/${gameRoomId}`)
    const currentTurn = gameData.turn || 1
    const targetPlayer = gameData.players[targetId]
    
    // Gece aksiyonunu kaydet
    const nightActionKey = `${playerId}_turn_${currentTurn}`
    const nightActionRef = ref(database, `games/${gameRoomId}/nightActions/${nightActionKey}`)
    await set(nightActionRef, {
      playerId,
      role: 'SABOTEUR',
      action: 'sabotage',
      targetId,
      turn: currentTurn,
      timestamp: Date.now()
    })
    
    // Kafa karışıklığı gecesi etkisi - iki oy geçersiz kılabilir
    const isConfusionNight = gameData.currentNightEvent?.id === 'confusion_night'
    const maxSabotage = isConfusionNight ? 2 : 1
    
    const currentSabotaged = gameData.sabotagedVotes || []
    if (currentSabotaged.filter(s => s.turn === gameData.turn).length >= maxSabotage) {
      alert(`Bu gece en fazla ${maxSabotage} oyun geçersiz kılabilirsiniz!`)
      return
    }
    
    const newSabotaged = [...currentSabotaged, {
      playerId: targetId,
      playerName: targetPlayer.name,
      saboteurId: playerId,
      turn: gameData.turn,
      sabotagedAt: Date.now()
    }]

    await update(gameRef, {
      sabotagedVotes: newSabotaged,
      [`players/${playerId}/sabotageUsed`]: !isConfusionNight, // Confusion night'da tekrar kullanabilir
      gamePhase: GAME_PHASES.ANALYST
    })
  }

  // Strateji Uzmanı - Oy analizi
  const analyzeVotes = async () => {
    if (myRole !== 'ANALYST' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    
    // Analiz gecesi etkisi - detaylı analiz
    const isAnalysisNight = gameData.currentNightEvent?.id === 'analysis_night'
    
    // Önceki turun oy verilerini analiz et
    const previousVotes = gameData.previousVotes || {}
    const voteAnalysis = {}
    
    Object.values(previousVotes).forEach(targetId => {
      voteAnalysis[targetId] = (voteAnalysis[targetId] || 0) + 1
    })
    
    // Analiz sonuçlarını kaydet
    const analystInfoRef = ref(database, `games/${gameRoomId}/analystInfo/${playerId}`)
    await push(analystInfoRef, {
      turn: gameData.turn,
      voteDistribution: voteAnalysis,
      analysisType: isAnalysisNight ? 'detailed' : 'basic',
      analyzedAt: Date.now()
    })

    await update(gameRef, {
      gamePhase: GAME_PHASES.INTUITIVE
    })
  }

  // Sezici - Rastgele bilgi al
  const getIntuition = async () => {
    if (myRole !== 'INTUITIVE' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const alivePlayers = Object.values(gameData.players).filter(p => p.isAlive && p.id !== playerId)
    
    if (alivePlayers.length === 0) return
    
    // Sezgi gecesi etkisi - %100 doğruluk
    const isIntuitionNight = gameData.currentNightEvent?.id === 'intuition_night'
    const accuracy = isIntuitionNight ? 1.0 : 0.7
    
    // Rastgele bir oyuncu seç
    const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
    
    // Bilgi türü belirle
    const infoTypes = ['role', 'team', 'location', 'symbol']
    const infoType = infoTypes[Math.floor(Math.random() * infoTypes.length)]
    
    let intuitionResult = ''
    const isAccurate = Math.random() < accuracy
    
    if (isAccurate) {
      switch (infoType) {
        case 'role':
          intuitionResult = `${randomPlayer.name}'in rolü: ${ROLES[randomPlayer.role].name}`
          break
        case 'team':
          intuitionResult = `${randomPlayer.name} ${ROLES[randomPlayer.role].team === 'good' ? 'iyi' : ROLES[randomPlayer.role].team === 'evil' ? 'kötü' : 'nötr'} takımda`
          break
        case 'location':
          intuitionResult = `${randomPlayer.name}'in konumu: ${randomPlayer.location}`
          break
        case 'symbol':
          intuitionResult = `${randomPlayer.name}'in özelliği: ${randomPlayer.visualSymbol}`
          break
      }
    } else {
      // Yanlış bilgi ver
      const fakeInfos = [
        `${randomPlayer.name} masum görünüyor`,
        `${randomPlayer.name} şüpheli davranışlar sergiliyor`,
        `${randomPlayer.name} hakkında net bir şey alamıyorum`
      ]
      intuitionResult = fakeInfos[Math.floor(Math.random() * fakeInfos.length)]
    }
    
    // Sezici bilgilerini kaydet
    const intuitiveInfoRef = ref(database, `games/${gameRoomId}/intuitiveInfo/${playerId}`)
    await push(intuitiveInfoRef, {
      turn: gameData.turn,
      targetPlayer: randomPlayer.name,
      intuition: intuitionResult,
      accuracy: isAccurate ? 'accurate' : 'inaccurate',
      intuitionType: infoType,
      receivedAt: Date.now()
    })

    await update(gameRef, {
      gamePhase: GAME_PHASES.DOUBLE_AGENT
    })
  }

  // İkili Ajan - Taraf seçimi (sadece ilk tur)
  const chooseTeam = async (team) => {
    if (myRole !== 'DOUBLE_AGENT' || !gameRoomId) return
    if (gameData.players[playerId].doubleAgentChoice) {
      alert('Taraf seçiminizi zaten yaptınız!')
      return
    }

    const gameRef = ref(database, `games/${gameRoomId}`)
    
    await update(gameRef, {
      [`players/${playerId}/doubleAgentChoice`]: team,
      gamePhase: GAME_PHASES.CHAOS_AGENT
    })
  }

  // Kaos Ustası - Rol değiştir
  const useChaosPower = async (targetId) => {
    if (myRole !== 'CHAOS_AGENT' || !gameRoomId) return
    if (gameData.players[playerId].chaosUsed) {
      alert('Kaos gücünüzü bu oyunda zaten kullandınız!')
      return
    }

    const gameRef = ref(database, `games/${gameRoomId}`)
    const currentTurn = gameData.turn || 1
    const targetPlayer = gameData.players[targetId]
    
    // Gece aksiyonunu kaydet
    const nightActionKey = `${playerId}_turn_${currentTurn}`
    const nightActionRef = ref(database, `games/${gameRoomId}/nightActions/${nightActionKey}`)
    await set(nightActionRef, {
      playerId,
      role: 'CHAOS_AGENT',
      action: 'chaos',
      targetId,
      turn: currentTurn,
      timestamp: Date.now()
    })
    
    // Rastgele yeni rol seç (temel roller hariç)
    const availableRoles = ['INNOCENT', 'SHADOW', 'FORENSIC', 'PSYCHOLOGIST', 'TWINS', 'REFLECTOR']
    const newRole = availableRoles[Math.floor(Math.random() * availableRoles.length)]
    
    await update(gameRef, {
      [`players/${targetId}/role`]: newRole,
      [`players/${playerId}/chaosUsed`]: true,
      gamePhase: GAME_PHASES.NIGHT
    })
    
    alert(`${targetPlayer.name}'in rolü ${ROLES[newRole].name} olarak değiştirildi!`)
  }

  // Gece olayı belirle
  const determineNightEvent = () => {
    // %30 ihtimalle özel bir olay olur
    if (Math.random() > 0.3) {
      // Normal gece
      return {
        id: 'normal_night',
        name: '🌙 Normal Gece',
        description: 'Sakin bir gece. Herkes normal görevlerini yapabilir.',
        effect: 'none',
        probability: 0.7
      }
    }
    
    // Olasılıklara göre özel olay seç
    const random = Math.random()
    let cumulativeProbability = 0
    
    for (const event of NIGHT_EVENTS) {
      cumulativeProbability += event.probability
      if (random <= cumulativeProbability) {
        return event
      }
    }
    
    // Eğer hiçbiri seçilmezse normal gece
    return {
      id: 'normal_night',
      name: '🌙 Normal Gece',
      description: 'Sakin bir gece. Herkes normal görevlerini yapabilir.',
      effect: 'none',
      probability: 0.7
    }
  }

  // Gece olayı etkilerini uygula
  const applyNightEventEffects = async (event) => {
    if (!event || !gameRoomId) return
    
    const gameRef = ref(database, `games/${gameRoomId}`)
    const updates = {}
    
    switch (event.effect) {
      case 'extra_clue':
        // Dedektife ekstra ipucu ver
        const detective = Object.values(gameData.players).find(p => p.role === 'DETECTIVE' && p.isAlive)
        if (detective && deadPlayers.length > 0) {
          const randomDeadPlayer = deadPlayers[Math.floor(Math.random() * deadPlayers.length)]
          const detectiveCluesRef = ref(database, `games/${gameRoomId}/detectiveClues/${detective.id}`)
          await push(detectiveCluesRef, {
            turn: gameData.turn,
            clue: `🌙 Gece olayı: ${randomDeadPlayer.name} hakkında ekstra bilgi - Rol: ${ROLES[randomDeadPlayer.role]?.name}`,
            from: 'Gece Olayı',
            addedAt: Date.now(),
            detective: detective.name
          })
        }
        break
        
      case 'insight_boost':
        // Tüm özel rollere ipucu ver
        Object.values(gameData.players).forEach(async (player) => {
          if (player.isAlive && ['DETECTIVE', 'FORENSIC', 'PSYCHOLOGIST', 'SPY'].includes(player.role)) {
            const playerCluesRef = ref(database, `games/${gameRoomId}/nightEventClues/${player.id}`)
            await push(playerCluesRef, {
              turn: gameData.turn,
              clue: `💡 İçgörü gecesi: Herkes daha dikkatli, sezgileriniz güçlü!`,
              addedAt: Date.now()
            })
          }
        })
        break
    }
    
    // Gece olayını kaydet
    updates.currentNightEvent = event
    await update(gameRef, updates)
  }

  // Oyuncu öldür (sadece katil)
  const killPlayer = async (targetId) => {
    if (myRole !== 'KILLER' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const currentTurn = gameData.turn || 1
    
    // Gece aksiyonunu kaydet
    const nightActionKey = `${playerId}_turn_${currentTurn}`
    const nightActionRef = ref(database, `games/${gameRoomId}/nightActions/${nightActionKey}`)
    await set(nightActionRef, {
      playerId,
      role: 'KILLER',
      action: 'kill',
      targetId,
      turn: currentTurn,
      timestamp: Date.now()
    })
    
    // Çoklu katil sistemi
    if (gameData.killerCount > 1) {
      // Katil oyunu kaydet
      const killerVoteRef = ref(database, `games/${gameRoomId}/killerVotes/${playerId}`)
      await set(killerVoteRef, targetId)
      
      // Tüm katillerin oy verip vermediğini kontrol et
      const killers = Object.values(gameData.players).filter(p => p.role === 'KILLER' && p.isAlive)
      const currentVotes = gameData.killerVotes || {}
      const updatedVotes = { ...currentVotes, [playerId]: targetId }
      
      // Eğer tüm katiller oy verdiyse
      if (Object.keys(updatedVotes).length === killers.length) {
        // En çok oy alan hedefi bul
        const voteCounts = {}
        Object.values(updatedVotes).forEach(vote => {
          voteCounts[vote] = (voteCounts[vote] || 0) + 1
        })
        
        const maxVotes = Math.max(...Object.values(voteCounts))
        const winners = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes)
        
        // Eğer berabere varsa rastgele seç
        const finalTarget = winners[Math.floor(Math.random() * winners.length)]
          const targetPlayer = gameData.players[finalTarget]
        
          // Koruma ve yansıtıcı kontrolü
        const updates = {}
        if (gameData.protectedPlayer === finalTarget) {
          // Oyuncu korundu, öldürülemez
          updates.gamePhase = GAME_PHASES.DAY
          updates.killerVotes = null
          updates.protectedPlayer = null
          updates.lastNightResult = 'protected'
          } else if (targetPlayer.role === 'REFLECTOR' && targetPlayer.reflectorUsed === false) {
            // Yansıtıcı saldırıyı geri yansıtır - rastgele bir katili öldür
            const randomKiller = killers[Math.floor(Math.random() * killers.length)]
            updates[`players/${randomKiller.id}/isAlive`] = false
            updates[`players/${randomKiller.id}/diedAt`] = Date.now()
            updates[`players/${randomKiller.id}/turnDied`] = gameData.turn
            updates[`players/${randomKiller.id}/killedBy`] = 'REFLECTOR'
            updates[`players/${finalTarget}/reflectorUsed`] = true
            updates.lastNightResult = 'reflected'
            updates.gamePhase = GAME_PHASES.DAY
            updates.killerVotes = null
            updates.protectedPlayer = null
        } else {
          // Hedef oyuncuyu öldür
          updates[`players/${finalTarget}/isAlive`] = false
          updates[`players/${finalTarget}/diedAt`] = Date.now()
          updates[`players/${finalTarget}/turnDied`] = gameData.turn
          updates[`players/${finalTarget}/killedBy`] = 'KILLERS'
          updates.gamePhase = GAME_PHASES.DAY
          updates.killerVotes = null
          updates.protectedPlayer = null
          updates.lastNightResult = 'killed'
        }
          
                    // Gece olayını belirle ve uygula
          const nightEvent = determineNightEvent()
          await applyNightEventEffects(nightEvent)
        
        await update(gameRef, updates)
      }
    } else {
      // Tek katil sistemi - koruma ve yansıtıcı kontrolü ile
      const updates = {}
      const targetPlayer = gameData.players[targetId]
      
      if (gameData.protectedPlayer === targetId) {
        // Oyuncu korundu, öldürülemez
        updates.gamePhase = GAME_PHASES.DAY
        updates.protectedPlayer = null
        updates.lastNightResult = 'protected'
      } else if (targetPlayer.role === 'REFLECTOR' && !targetPlayer.reflectorUsed) {
        // Yansıtıcı saldırıyı geri yansıtır
        const killer = Object.values(gameData.players).find(p => p.role === 'KILLER' && p.isAlive)
        if (killer) {
          updates[`players/${killer.id}/isAlive`] = false
          updates[`players/${killer.id}/diedAt`] = Date.now()
          updates[`players/${killer.id}/turnDied`] = gameData.turn
          updates[`players/${killer.id}/killedBy`] = 'REFLECTOR'
          updates[`players/${targetId}/reflectorUsed`] = true
          updates.lastNightResult = 'reflected'
        }
        updates.gamePhase = GAME_PHASES.DAY
        updates.protectedPlayer = null
      } else {
        // Hedef oyuncuyu öldür
        updates[`players/${targetId}/isAlive`] = false
        updates[`players/${targetId}/diedAt`] = Date.now()
        updates[`players/${targetId}/turnDied`] = gameData.turn
        updates[`players/${targetId}/killedBy`] = 'KILLER'
        updates.gamePhase = GAME_PHASES.DAY
        updates.protectedPlayer = null
        updates.lastNightResult = 'killed'
      }
      
      // Gece olayını belirle ve uygula
      const nightEvent = determineNightEvent()
      await applyNightEventEffects(nightEvent)
      
      await update(gameRef, updates)
    }
  }

  // Oy ver
  const votePlayer = async (targetId) => {
    if (!playerId || !gameRoomId) return

    // Ölen oyuncular oy veremez
    const currentPlayer = gameData.players[playerId]
    if (!currentPlayer || !currentPlayer.isAlive) {
      console.log('Ölen oyuncular oy veremez!')
      return
    }

    let finalTargetId = targetId
    let voteMessage = ''
    
    // Manipülasyon kontrolü (öncelik hipnotizasyona göre)
    const manipulatedVotes = gameData.manipulatedVotes || []
    const isManipulated = manipulatedVotes.some(m => m.targetId === playerId && m.turn === gameData.turn)
    
    if (isManipulated) {
      // Manipüle edilmiş oyuncu - oyu manipülatörün belirlediği hedefe yönlendir
      const manipulationData = manipulatedVotes.find(m => m.targetId === playerId && m.turn === gameData.turn)
      finalTargetId = manipulationData.redirectToId
      voteMessage = `🧠 Manipüle edildiniz! Oyunuz ${manipulationData.redirectToName}'e yönlendirildi.`
    } else {
      // Hipnotize edilmiş mi kontrol et
      const hypnotizedPlayers = gameData.hypnotizedPlayers || []
      const isHypnotized = hypnotizedPlayers.some(h => h.playerId === playerId && h.turn === gameData.turn)
      
      if (isHypnotized) {
        // Hipnotize edilmiş oyuncu - oyu kan emicinin belirlediği hedefe yönlendir
        const hypnotizeData = hypnotizedPlayers.find(h => h.playerId === playerId && h.turn === gameData.turn)
        const vampire = gameData.players[hypnotizeData.vampireId]
        
        if (vampire && vampire.isAlive) {
          // Kan emicinin belirlediği hedefi bul (bu örnekte rastgele bir düşman)
          const alivePlayers = Object.values(gameData.players).filter(p => p.isAlive && p.id !== playerId)
          const goodTeamPlayers = alivePlayers.filter(p => 
            ['DETECTIVE', 'SPY', 'SECURITY', 'INNOCENT', 'FORENSIC', 'PSYCHOLOGIST', 'TWINS', 'REFLECTOR', 'SHADOW_GUARDIAN', 'ANALYST', 'INTUITIVE'].includes(p.role)
          )
          
          if (goodTeamPlayers.length > 0) {
            finalTargetId = goodTeamPlayers[Math.floor(Math.random() * goodTeamPlayers.length)].id
            voteMessage = '🧛 Hipnotize edildiniz! Oyunuz farklı bir hedefe yönlendirildi.'
          }
        }
      }
    }

    const voteRef = ref(database, `games/${gameRoomId}/votes/${playerId}`)
    await set(voteRef, finalTargetId)
    setHasVoted(true)
    
    // Etkilenmiş oyuncuya bilgi ver
    if (voteMessage) {
      alert(voteMessage)
    }
  }

  // İkiz çift oy kullan
  const useDoubleVote = async (targetId) => {
    if (!playerId || !gameRoomId) return
    
    const currentPlayer = gameData.players[playerId]
    if (!currentPlayer || !currentPlayer.isAlive || currentPlayer.role !== 'TWINS') return
    
    // İkizin eşi öldü mü ve daha önce çift oy kullanıldı mı kontrol et
    const twin = gameData.players[currentPlayer.twinId]
    if (!twin || twin.isAlive || currentPlayer.doubleVoteUsed) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    await update(gameRef, {
      [`votes/${playerId}`]: targetId,
      [`votes/${playerId}_double`]: targetId, // Çift oy
      [`players/${playerId}/doubleVoteUsed`]: true
    })
  }

  // Oyları say ve eleme yap (sadece host)
  const processVotes = async () => {
    if (!isHost || !gameRoomId) return

    const votes = gameData.votes || {}
    const alivePlayers = Object.values(gameData.players).filter(p => p.isAlive)
    const alivePlayerIds = alivePlayers.map(p => p.id)
    
    // Tüm yaşayan oyuncular oy verdi mi kontrol et
    const votedPlayerIds = Object.keys(votes)
    const allVoted = alivePlayerIds.every(id => votedPlayerIds.includes(id))
    
    // Eğer tüm oyuncular oy vermediyse ve süre dolmadıysa bekle
    if (!allVoted && gameData.votingStartTime) {
      const elapsed = Math.floor((Date.now() - gameData.votingStartTime) / 1000)
      const timeLeft = Math.max(0, 90 - elapsed)
      
      if (timeLeft > 0) {
        console.log('⏳ Tüm oyuncular henüz oy vermedi, bekleniyor...', {
          voted: votedPlayerIds.length,
          total: alivePlayerIds.length,
          timeLeft
        })
        return // Henüz işleme
      }
    }

    console.log('🗳️ Oylar işleniyor...', { votes, alivePlayers: alivePlayerIds.length })
    
    const voteCounts = {}
    
    // Sabotajlı oyları kontrol et
    const sabotagedVotes = gameData.sabotagedVotes || []
    const sabotagedPlayerIds = sabotagedVotes
      .filter(s => s.turn === gameData.turn)
      .map(s => s.playerId)
    
    // Sadece yaşayan oyuncuların oylarını say (SKIP oylarını ve sabotajlı oyları hariç tut)
    Object.entries(votes).forEach(([voterId, targetId]) => {
      const voter = gameData.players[voterId]
      const isSabotaged = sabotagedPlayerIds.includes(voterId)
      
      if (voter && voter.isAlive && targetId !== 'SKIP' && !isSabotaged) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
      }
    })

    // En çok oy alan oyuncu
    const maxVotes = Math.max(...Object.values(voteCounts))
    const topVotedPlayers = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes)
    
    // Eğer eşitlik varsa veya hiç oy yoksa kimse elenmez
    if (maxVotes === 0 || topVotedPlayers.length > 1) {
      // Kimse elenmedi - Oyun devam ediyor
      const gameRef = ref(database, `games/${gameRoomId}`)
      const updates = {}
      
      // Oyları temizle
      updates.votes = null
      updates.votingTimeLeft = null
      updates.votingStartTime = null
      
      // Yeni tura geç
      updates.turn = (gameData.turn || 1) + 1
      
      // Güvenlik fazına geç (eğer güvenlik varsa)
      const alivePlayers = Object.values(gameData.players).filter(p => p.isAlive)
      const hasSecurity = alivePlayers.some(p => p.role === 'SECURITY')
      if (hasSecurity) {
        updates.gamePhase = GAME_PHASES.SECURITY
      } else {
        updates.gamePhase = GAME_PHASES.NIGHT
      }
      
      await update(gameRef, updates)
      return
    }
    
    const eliminatedId = topVotedPlayers[0]
    
    // Şöhret Avcısı kazanma kontrolü
    if (eliminatedId && gameData.players[eliminatedId].role === 'ATTENTION_SEEKER') {
      const gameRef = ref(database, `games/${gameRoomId}`)
      await update(gameRef, {
        gamePhase: GAME_PHASES.GAME_OVER,
        winner: `Nötr Takım (${ROLES.ATTENTION_SEEKER.name})`,
        winReason: `${gameData.players[eliminatedId].name} en çok oyu alarak öldürülmeyi başardı!`,
        votes: null
      })
      return
    }
    
    if (eliminatedId) {
      const gameRef = ref(database, `games/${gameRoomId}`)
      const updates = {}
      
      // Oyuncuyu eleme
      updates[`players/${eliminatedId}/isAlive`] = false
      updates[`players/${eliminatedId}/eliminatedByVote`] = true
      updates[`players/${eliminatedId}/turnDied`] = gameData.turn
      
      // Oyları temizle
      updates.votes = null
      
      // Oyun bitimi kontrolü
      const alivePlayers = Object.values(gameData.players).filter(p => 
        p.isAlive && p.id !== eliminatedId
      )
      
      const aliveKillers = alivePlayers.filter(p => p.role === 'KILLER')
      const aliveVampires = alivePlayers.filter(p => p.role === 'VAMPIRE')
      const aliveDetective = alivePlayers.find(p => p.role === 'DETECTIVE')
      const aliveSpy = alivePlayers.find(p => p.role === 'SPY')
      const aliveSecurity = alivePlayers.find(p => p.role === 'SECURITY')
      const totalAlive = alivePlayers.length
      const totalEvil = aliveKillers.length + aliveVampires.length
      
      // İyi takım üyelerini say
      const aliveGoodTeam = alivePlayers.filter(p => 
        ['DETECTIVE', 'SPY', 'SECURITY', 'INNOCENT', 'FORENSIC', 'PSYCHOLOGIST', 'TWINS', 'REFLECTOR', 'SHADOW_GUARDIAN', 'ANALYST', 'INTUITIVE'].includes(p.role)
      )
      
      // Kötü takım üyelerini say (İkili ajan seçimine göre)
      const aliveEvilTeam = alivePlayers.filter(p => {
        if (p.role === 'DOUBLE_AGENT') {
          return p.doubleAgentChoice === 'evil'
        }
        return ['KILLER', 'VAMPIRE', 'MANIPULATOR', 'DECOY_KILLER', 'SABOTEUR', 'FAKE_DETECTIVE'].includes(p.role)
      })
      
      // Nötr oyuncuları say
      const aliveNeutral = alivePlayers.filter(p => {
        if (p.role === 'DOUBLE_AGENT') {
          return !p.doubleAgentChoice // Henüz seçim yapmamış
        }
        return ['SHADOW', 'MYSTERIOUS', 'SURVIVOR', 'CHAOS_AGENT', 'ATTENTION_SEEKER'].includes(p.role)
      })
      
      if (totalEvil === 0) {
        // Tüm kötü takım elendi - İyi takım kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'İyi Takım (Dedektif + Masum + Casus + Güvenlik + Adli Tıpçı + Psikolog + İkizler + Yansıtıcı)'
        updates.winReason = 'Tüm katiller ve kan emiciler elenmiştir'
      } else if (aliveGoodTeam.length === 0) {
        // Tüm iyi takım öldü - Kötü takım kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'Kötü Takım (Katiller + Kan Emici)'
        updates.winReason = 'Tüm iyi takım üyeleri elendi'
      } else if (totalEvil >= aliveGoodTeam.length && aliveNeutral.length === 0) {
        // Kötü takım sayısı >= İyi takım sayısı ve nötr yok - Kötü takım kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'Kötü Takım (Katiller + Kan Emici)'
        updates.winReason = 'Kötü takım sayı üstünlüğü ele geçirdi'
      } else if (totalAlive === 3 && aliveNeutral.length === 1 && ['SHADOW', 'MYSTERIOUS', 'SURVIVOR'].includes(aliveNeutral[0].role)) {
        // Son 3 kişi kaldı ve hayatta kalma odaklı nötr rol hayatta - Nötr kazandı
        const neutralPlayer = aliveNeutral[0]
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = `Nötr Takım (${ROLES[neutralPlayer.role].name})`
        updates.winReason = `${neutralPlayer.name} son 3 kişide hayatta kalmayı başardı!`
      } else if (aliveNeutral.some(p => p.role === 'CHAOS_AGENT') && aliveGoodTeam.length === 0 && aliveEvilTeam.length === 0) {
        // Sadece kaos ustası kaldı - Kaos kazandı
        const chaosAgent = aliveNeutral.find(p => p.role === 'CHAOS_AGENT')
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = `Nötr Takım (${ROLES.CHAOS_AGENT.name})`
        updates.winReason = `${chaosAgent.name} tüm tarafları yok ederek kaos yaratmayı başardı!`
      } else if (totalAlive === 3 && aliveDetective && totalEvil === 1) {
        // Son 3 kişi kaldı, dedektif hayatta ve 1 kötü kaldı - Son tahmin hakkı
        updates.gamePhase = GAME_PHASES.FINAL_GUESS
        updates.finalGuessAvailable = true
      } else {
        // Oyun devam ediyor - Yeni tura geç
        updates.turn = (gameData.turn || 1) + 1
        
        // Güvenlik fazına geç (eğer güvenlik varsa)
        const hasSecurity = alivePlayers.some(p => p.role === 'SECURITY')
        if (hasSecurity) {
          updates.gamePhase = GAME_PHASES.SECURITY
        } else {
          updates.gamePhase = GAME_PHASES.NIGHT
        }
      }
      
      await update(gameRef, updates)
    }
  }

  // İpucu ekle (sadece dedektif)
  const addClue = async (deadPlayerId) => {
    if (myRole !== 'DETECTIVE' || !gameRoomId) return

    const deadPlayer = Object.values(gameData.players).find(p => p.id === deadPlayerId)
    const killer = Object.values(gameData.players).find(p => p.role === 'KILLER')
    const alivePlayers = Object.values(gameData.players).filter(p => p.isAlive)
    
    // Konum tabanlı ipuçları
    const locationClues = [
      `${deadPlayer.name} ${deadPlayer.location} yakınında bulundu. Olay yerinde ${killer.location} bölgesinden gelen ayak izleri var.`,
      `Ceset ${deadPlayer.location} bölgesinde keşfedildi. Yakınlarda ${killer.location} civarından birinin görüldüğü bildirildi.`,
      `${deadPlayer.name}'in son görüldüğü yer ${deadPlayer.location}. Tanıklar ${killer.location} bölgesinden şüpheli birini gördüklerini söylüyor.`,
      `Olay yeri ${deadPlayer.location}. Katil muhtemelen ${killer.location} bölgesinde yaşıyor veya çalışıyor.`
    ]
    
    // Görsel sembol tabanlı ipuçları
    const symbolClues = [
      `${deadPlayer.name}'in yanında ${killer.visualSymbol} takmış birinin gözüktüğü güvenlik kamerası görüntüsü bulundu.`,
      `Tanıklar katilın ${killer.visualSymbol} taktığını söylüyor. ${deadPlayer.name} son nefesinde bunu işaret etmeye çalışmış.`,
      `Olay yerinde ${killer.visualSymbol} ile ilgili bir iz bulundu. Katil muhtemelen bu özelliğe sahip.`,
      `${deadPlayer.name}'in defansif yaraları var, saldırganın ${killer.visualSymbol} taktığını gösteriyor.`
    ]
    
    // Sahte/Çelişkili notlar (Kan emici ve gizemli adam için)
    const fakeClues = [
      `Siyah giyimli birini gördüm ama yüzünü göremedim.`,
      `Katil ${Math.random() > 0.5 ? 'uzun boylu' : 'kısa boylu'} biriydi, eminim.`,
      `Olay sırasında ${VISUAL_SYMBOLS[Math.floor(Math.random() * VISUAL_SYMBOLS.length)]} takmış birini gördüm.`,
      `Katil ${LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]} bölgesinden geliyordu, kesin.`
    ]
    
    // İpucu türünü belirle
    let selectedClue
    const random = Math.random()
    
    // Kan emici veya gizemli adam varsa %30 ihtimalle sahte ipucu
    const hasDeceptiveRoles = alivePlayers.some(p => ['VAMPIRE', 'MYSTERIOUS', 'SHADOW'].includes(p.role))
    
    if (hasDeceptiveRoles && random < 0.3) {
      selectedClue = fakeClues[Math.floor(Math.random() * fakeClues.length)]
    } else if (random < 0.6) {
      selectedClue = locationClues[Math.floor(Math.random() * locationClues.length)]
    } else {
      selectedClue = symbolClues[Math.floor(Math.random() * symbolClues.length)]
    }
    
    // İpuçları sadece dedektife özel olarak kaydedilir
    const detectiveCluesRef = ref(database, `games/${gameRoomId}/detectiveClues/${playerId}`)
    await push(detectiveCluesRef, {
      turn: gameData.turn,
      clue: selectedClue,
      from: deadPlayer.name,
      addedAt: Date.now(),
      detective: players.find(p => p.id === playerId)?.name,
      clueType: hasDeceptiveRoles && random < 0.3 ? 'fake' : (random < 0.6 ? 'location' : 'symbol')
    })
  }

  // Oyun fazını değiştir (sadece host)
  const changeGamePhase = async (newPhase) => {
    if (!isHost || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    await update(gameRef, { gamePhase: newPhase })
  }

  // Faz değişikliklerinde seçimleri sıfırla
  useEffect(() => {
    if (gamePhase !== GAME_PHASES.PSYCHOLOGIST) {
      setSelectedPlayer1(null)
      setSelectedPlayer2(null)
    }
  }, [gamePhase])

  // Oyunu sıfırla
  const resetGame = async () => {
    if (gameRoomId) {
      const gameRef = ref(database, `games/${gameRoomId}`)
      await remove(gameRef)
    }
    
    // Oylama timer'ını temizle
    if (votingTimer) {
      clearInterval(votingTimer)
      setVotingTimer(null)
    }
    
    setGameRoomId(null)
    setPlayerId(null)
    setIsHost(false)
    setGameData(null)
    setPlayers([])
    setMyRole(null)
    setConnectionStatus('disconnected')
    setVotingTimeLeft(0)
    setHasVoted(false)
  }

  // Ana sayfaya dön
  const goBackToHome = () => {
    resetGame()
  }

  // Oylama süresini başlat (sadece host)
  const startVotingTimer = async () => {
    if (!isHost || !gameRoomId) return

    const VOTING_TIME = 60 // 60 saniye
    const gameRef = ref(database, `games/${gameRoomId}`)
    
    await update(gameRef, {
      votingTimeLeft: VOTING_TIME,
      votingStartTime: Date.now()
    })
  }

  // Boş oy at
  const voteSkip = async () => {
    if (!playerId || !gameRoomId) return

    const currentPlayer = gameData.players[playerId]
    if (!currentPlayer || !currentPlayer.isAlive) return

    const voteRef = ref(database, `games/${gameRoomId}/votes/${playerId}`)
    await set(voteRef, 'SKIP')
    setHasVoted(true)
  }

  // Oylamayı geç
  const skipVoting = async () => {
    if (!playerId || !gameRoomId) return

    const currentPlayer = gameData.players[playerId]
    if (!currentPlayer || !currentPlayer.isAlive) return

    const voteRef = ref(database, `games/${gameRoomId}/votes/${playerId}`)
    await set(voteRef, 'SKIP')
    setHasVoted(true)
  }

  // Son tahmin yap (sadece dedektif)
  const makeFinalGuess = async (suspectId) => {
    if (myRole !== 'DETECTIVE' || !gameRoomId) return

    const suspect = Object.values(gameData.players).find(p => p.id === suspectId)
    const gameRef = ref(database, `games/${gameRoomId}`)
    
    const updates = {}
    
    if (suspect.role === 'KILLER' || suspect.role === 'VAMPIRE') {
      // Doğru tahmin - İyi takım kazandı
      updates.gamePhase = GAME_PHASES.GAME_OVER
              updates.winner = 'İyi Takım (Dedektif + Casus + Güvenlik + Diğer İyi Roller)'
      updates.winReason = `Dedektif ${suspect.name}'i doğru tahmin etti!`
      updates.finalGuessCorrect = true
    } else {
      // Yanlış tahmin - Kötü takım kazandı
      updates.gamePhase = GAME_PHASES.GAME_OVER
      updates.winner = 'Kötü Takım (Katiller + Kan Emici)'
      updates.winReason = `Dedektif yanlış tahmin etti! ${suspect.name} kötü takımdan değildi.`
      updates.finalGuessCorrect = false
    }
    
    updates.finalGuessTarget = suspectId
    updates.finalGuessBy = playerId
    
    await update(gameRef, updates)
  }

  // Parçacık efekti bileşeni
  const ParticleEffect = () => {
    const particles = Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 15}s`,
          animationDuration: `${15 + Math.random() * 10}s`
        }}
      />
    ))
    return <div className="particles">{particles}</div>
  }

  // Oyun odası bağlantısı yok
  if (!gameRoomId) {
    return (
      <div className="min-h-screen text-white flex flex-col overflow-hidden relative">
        <ParticleEffect />
        
        {/* Bağlantı durumu göstergesi */}
        <div className={`connection-status ${firebaseConnected ? 'connected' : 'disconnected'}`}>
          <div className={`w-2 h-2 rounded-full inline-block mr-2 ${
            firebaseConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          {firebaseConnected ? '🟢 Bağlı' : '🔴 Bağlantı Yok'}
        </div>

        {/* Ana Header */}
        <header className="text-center py-16 relative">
          <div className="max-w-4xl mx-auto px-4 animate-fadeIn">
            <div className="game-logo">🔪</div>
            <h1 className="main-title text-6xl md:text-8xl mb-4">
              TERS DEDEKTİF
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-300 animate-pulse-custom">
              KATİLİ BUL
            </h2>
            <p className="text-xl text-gray-300 mb-6 animate-slideInLeft">
              🔥 Dinamik Roller & Gece Olayları - Gerçek zamanlı multiplayer dedektif oyunu
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm animate-slideInRight">
              <span className="bg-purple-700/50 px-4 py-2 rounded-full border border-purple-500/30 hover:bg-purple-600/50 transition-all animate-bounce-custom">🎭 Gizli Roller</span>
              <span className="bg-red-700/50 px-4 py-2 rounded-full border border-red-500/30 hover:bg-red-600/50 transition-all animate-bounce-custom" style={{animationDelay: '0.2s'}}>🌙 Gece Öldürme</span>
              <span className="bg-yellow-700/50 px-4 py-2 rounded-full border border-yellow-500/30 hover:bg-yellow-600/50 transition-all animate-bounce-custom" style={{animationDelay: '0.4s'}}>☀️ Gündüz Oylama</span>
              <span className="bg-blue-700/50 px-4 py-2 rounded-full border border-blue-500/30 hover:bg-blue-600/50 transition-all animate-bounce-custom" style={{animationDelay: '0.6s'}}>🔍 İpucu Toplama</span>
            </div>
            <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => setShowRules(true)}
                className="btn-secondary animate-glow"
            >
              📖 Oyun Kuralları
            </button>
              <button
                onClick={() => setShowRoles(true)}
                className="btn-primary animate-glow"
              >
                🎭 Tüm Roller
            </button>
            </div>
          </div>
        </header>

        {/* Ana İçerik */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
            
            {/* Sol Taraf - Roller */}
            <div className="card card-glow animate-slideInLeft">
              <h2 className="text-3xl font-bold mb-6 text-center text-purple-300 text-glow">🎭 OYUN ROLLERİ</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.values(ROLES).slice(0, 6).map((role, index) => (
                  <div key={index} className="bg-gray-700/50 p-4 rounded-xl border-l-4 border-purple-500 hover:bg-gray-600/50 transition-all hover:scale-105 animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                    <h3 className="text-lg font-bold mb-2 text-yellow-300">{role.name}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{role.description}</p>
                  </div>
                ))}
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-xl border border-purple-500/30">
                  <h4 className="font-bold text-purple-300 mb-2">🎲 + 6 Rastgele Rol</h4>
                  <p className="text-sm text-gray-300">Her oyunda 2-3 tanesi rastgele seçilir!</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/50 to-red-900/50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-yellow-300">🎯 Oyun Amacı</h3>
                <p className="text-sm text-gray-300">
                  İyi takım katili bulmaya, katil ise yakalanmamaya çalışır. 
                  Strateji, dedüksiyon ve blöf bu oyunun anahtarıdır!
                </p>
              </div>
            </div>

            {/* Sağ Taraf - Oyuna Katılma */}
            <div className="card card-glow animate-slideInRight">
              <h2 className="text-3xl font-bold mb-6 text-center text-green-300 text-glow">🎮 OYUNA KATIL</h2>
              
              <div className="mb-6 animate-fadeIn">
                <label className="block text-sm font-bold mb-2 text-gray-300">
                  👤 Oyuncu Adınız
                </label>
                <input
                  type="text"
                  placeholder="Dedektif adınızı girin..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="input-modern w-full"
                />
              </div>

              <div className="space-y-4 animate-scaleIn">
                <button
                  onClick={createGameRoom}
                  className="btn-success w-full text-lg"
                >
                  🎮 Yeni Oyun Odası Oluştur
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">veya</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ABC123 (5-6 haneli kod)"
                    className="input-modern flex-1"
                    maxLength="6"
                    style={{textTransform: 'uppercase'}}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        joinGameRoom(e.target.value)
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.parentElement.querySelector('input')
                      joinGameRoom(input.value)
                    }}
                    className="btn-secondary px-6"
                  >
                    Katıl
                  </button>
                </div>
              </div>

              {/* Oyun İstatistikleri */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-300">4+</div>
                  <div className="text-sm text-gray-400">Min. Oyuncu</div>
                </div>
                <div className="bg-gradient-to-r from-red-900/50 to-yellow-900/50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-yellow-300">∞</div>
                  <div className="text-sm text-gray-400">Sınırsız Eğlence</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Footer */}
        <footer className="text-center py-6 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              firebaseConnected 
                ? 'bg-green-900/50 text-green-300' 
                : 'bg-red-900/50 text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                firebaseConnected ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              Firebase: {firebaseConnected ? 'Bağlı' : 'Bağlantı Yok'}
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            🎮 Arkadaşlarınızla birlikte oynayın • 🔥 Firebase ile gerçek zamanlı
          </p>
        </footer>

        {/* Kurallar Modalı - Büyük Ekran */}
        {showRules && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
            <div className="w-full max-w-7xl max-h-[95vh] bg-gradient-to-br from-gray-900 via-orange-900/50 to-gray-900 rounded-2xl border border-orange-500/30 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-900/80 to-red-900/80 p-6 border-b border-orange-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                  📖 OYUN KURALLARI
                </h2>
                    <p className="text-gray-300 text-lg">Ters Dedektif: Katili Bul - Detaylı Oyun Rehberi</p>
                  </div>
                  <button
                    onClick={() => setShowRules(false)}
                    className="text-gray-400 hover:text-white text-3xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6">
                
                {/* Ana Oyun Bilgileri */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  {/* Sol Kolon */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-6 rounded-xl border border-purple-500/30">
                      <h3 className="font-bold text-2xl mb-4 text-purple-300">🎯 OYUNUN AMACI</h3>
                      <p className="text-gray-300 leading-relaxed text-lg mb-4">
                        Bu bir sosyal çıkarım oyunudur. İyi takım (Dedektif, Casus, Güvenlik ve diğer iyi roller) katili bulmaya çalışırken, 
                      katil yakalanmamaya ve herkesi elemeye çalışır.
                    </p>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-yellow-300 mb-2">🎮 Oyun Türü</h4>
                        <p className="text-sm text-gray-300">Sosyal çıkarım, blöf, strateji ve takım çalışması gerektiren multiplayer oyun</p>
                      </div>
                  </div>

                    <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 p-6 rounded-xl border border-green-500/30">
                      <h3 className="font-bold text-2xl mb-4 text-green-300">🎮 OYNANIŞIN SIRASI</h3>
                      <div className="space-y-4">
                      <div className="flex items-start gap-3">
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-2 rounded-lg font-bold min-w-[2rem] text-center">1</span>
                        <div>
                            <strong className="text-yellow-300 text-lg">Lobby Aşaması</strong>
                            <p className="text-gray-300">Oyuncular oda kodunu paylaşarak katılır (minimum 4 kişi)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-2 rounded-lg font-bold min-w-[2rem] text-center">2</span>
                        <div>
                            <strong className="text-yellow-300 text-lg">Rol Dağıtımı</strong>
                            <p className="text-gray-300">Her oyuncu gizlice kendi rolünü öğrenir</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-2 rounded-lg font-bold min-w-[2rem] text-center">3</span>
                        <div>
                            <strong className="text-yellow-300 text-lg">Gece Fazı</strong>
                            <p className="text-gray-300">Roller gece yeteneklerini kullanır (katil kurbanını seçer)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-2 rounded-lg font-bold min-w-[2rem] text-center">4</span>
                        <div>
                            <strong className="text-yellow-300 text-lg">Gündüz Fazı</strong>
                            <p className="text-gray-300">Herkes tartışır, dedektif ipucu alabilir</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-2 rounded-lg font-bold min-w-[2rem] text-center">5</span>
                        <div>
                            <strong className="text-yellow-300 text-lg">Oylama Fazı</strong>
                            <p className="text-gray-300">En çok oy alan oyuncu elenir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Sağ Kolon */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
                      <h3 className="font-bold text-2xl mb-4 text-red-300">🏆 KAZANMA KOŞULLARI</h3>
                      <div className="space-y-4">
                        <div className="bg-green-800/40 p-4 rounded-lg border border-green-600/30">
                          <strong className="text-green-300 text-lg">👼 İyi Takım Kazanır:</strong>
                          <p className="text-gray-300 mt-2">Tüm katilleri ve kan emicileri oylama ile elerlerse</p>
                        </div>
                        <div className="bg-red-800/40 p-4 rounded-lg border border-red-600/30">
                          <strong className="text-red-300 text-lg">😈 Kötü Takım Kazanır:</strong>
                          <p className="text-gray-300 mt-2">Tüm iyi takımı öldürürse veya sayı üstünlüğü ele geçirirse</p>
                        </div>
                        <div className="bg-purple-800/40 p-4 rounded-lg border border-purple-600/30">
                          <strong className="text-purple-300 text-lg">🔮 Nötr Takım Kazanır:</strong>
                          <p className="text-gray-300 mt-2">Hayatta Kalan/Gölge son 3 kişide kalırsa, Şöhret Avcısı en çok oyu alıp ölürse, Kaos Ustası tüm tarafları yok ederse</p>
                        </div>
                        <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-600/30">
                          <strong className="text-blue-300 text-lg">⚡ Son Tahmin:</strong>
                          <p className="text-gray-300 mt-2">3 kişi kalırsa ve dedektif hayattaysa, son tahmin hakkı</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 p-6 rounded-xl border border-yellow-500/30">
                      <h3 className="font-bold text-2xl mb-4 text-yellow-300">⚠️ ÖNEMLİ KURALLAR</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-yellow-400 text-xl">🔒</span>
                          <span className="text-gray-300">Roller gizli tutulmalıdır</span>
                      </div>
                        <div className="flex items-start gap-3">
                          <span className="text-yellow-400 text-xl">🕵️</span>
                          <span className="text-gray-300">Casus katili bilir ama belli etmemelidir</span>
                      </div>
                        <div className="flex items-start gap-3">
                          <span className="text-yellow-400 text-xl">🔍</span>
                          <span className="text-gray-300">Dedektif ipuçlarını dikkatlice değerlendirmelidir</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-yellow-400 text-xl">🤝</span>
                          <span className="text-gray-300">İyi takım üyeleri dedektife yardım etmeye çalışmalıdır</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-yellow-400 text-xl">🚫</span>
                          <span className="text-gray-300">Oyun dışı iletişim kurulmaz</span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>

                {/* Dinamik Özellikler */}
                <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 p-6 rounded-xl border border-orange-500/30 mb-8">
                  <h3 className="font-bold text-2xl mb-6 text-orange-300 text-center">🎲 DİNAMİK ÖZELLİKLER</h3>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-yellow-300 mb-2 text-lg">🎭 Rastgele Roller</h4>
                        <p className="text-gray-300 mb-2">Her oyunda 2-3 ekstra rol aktif olur</p>
                        <p className="text-xs text-yellow-400">Hangi rollerin aktif olduğu lobby'de gösterilir</p>
                  </div>

                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-300 mb-2 text-lg">🌙 Gece Olayları</h4>
                        <p className="text-gray-300 mb-2">%30 ihtimalle gece özel olaylar yaşanır</p>
                        <p className="text-xs text-purple-400">Rollerin güçlerini artırabilir veya kısıtlayabilir</p>
                    </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-300 mb-2 text-lg">📍 Konum Sistemi</h4>
                        <p className="text-gray-300 mb-2">Her oyuncunun bir konumu var</p>
                        <p className="text-xs text-blue-400">İpuçlarda konum bilgileri kullanılır</p>
                  </div>
                </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-green-300 mb-2 text-lg">👁️ Görsel Semboller</h4>
                        <p className="text-gray-300 mb-2">Her oyuncunun görsel özelliği var</p>
                        <p className="text-xs text-green-400">İpuçlarda görsel özellikler kullanılır</p>
              </div>
              
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-red-300 mb-2 text-lg">⚠️ Sahte İpuçları</h4>
                        <p className="text-gray-300 mb-2">%30 ihtimalle yanıltıcı ipuçları</p>
                        <p className="text-xs text-red-400">Aldatıcı roller sahte ipuçları oluşturabilir</p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-cyan-300 mb-2 text-lg">🎯 Oyuncu Sayısı</h4>
                        <p className="text-gray-300 mb-2">4-15 kişi arası oynanabilir</p>
                        <p className="text-xs text-cyan-400">Oyuncu sayısına göre rol dağılımı değişir</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gece Olayları Detayı */}
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 rounded-xl border border-purple-500/30 mb-8">
                  <h3 className="font-bold text-2xl mb-6 text-purple-300 text-center">🌙 GECE OLAYLARI SİSTEMİ</h3>
                  <div className="mb-4 p-4 bg-gray-800/50 rounded-lg text-center">
                    <p className="text-lg text-gray-300 mb-2">
                      <strong className="text-purple-300">Gerçekleşme İhtimali:</strong> Her gece %30 şans ile özel bir olay yaşanır
                    </p>
                    <p className="text-sm text-gray-400">
                      Gece olayları rollerin güçlerini artırabilir, kısıtlayabilir veya yeni mekanikler ekleyebilir
                    </p>
                  </div>
                  
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-blue-300 mb-3">🌫️ Kısıtlayıcı Olaylar</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-blue-800/30 p-2 rounded">
                          <strong className="text-blue-300">☁️ Bulutlu Gece (15%)</strong>
                          <p className="text-gray-300">Adli tıpçı çalışamaz</p>
                        </div>
                        <div className="bg-gray-800/30 p-2 rounded">
                          <strong className="text-gray-300">⛈️ Fırtınalı Gece (15%)</strong>
                          <p className="text-gray-300">Psikolog çalışamaz</p>
                        </div>
                        <div className="bg-yellow-800/30 p-2 rounded">
                          <strong className="text-yellow-300">😱 Panik Gecesi (10%)</strong>
                          <p className="text-gray-300">Kimse oy veremez</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-green-300 mb-3">✨ Güçlendirici Olaylar</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-red-800/30 p-2 rounded">
                          <strong className="text-red-300">😨 Çığlık Gecesi (12%)</strong>
                          <p className="text-gray-300">Dedektif ekstra ipucu alır</p>
                        </div>
                        <div className="bg-pink-800/30 p-2 rounded">
                          <strong className="text-pink-300">💫 Empati Gecesi (7%)</strong>
                          <p className="text-gray-300">Psikolog 3 kişilik analiz yapabilir</p>
                        </div>
                        <div className="bg-purple-800/30 p-2 rounded">
                          <strong className="text-purple-300">🌕 Dolunay (8%)</strong>
                          <p className="text-gray-300">Kan emici 2 kişiyi hipnotize edebilir</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-orange-300 mb-3">🎭 Özel Olaylar</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-green-800/30 p-2 rounded">
                          <strong className="text-green-300">👼 Koruyucu Gece (5%)</strong>
                          <p className="text-gray-300">Kimse öldürülemez</p>
                        </div>
                        <div className="bg-cyan-800/30 p-2 rounded">
                          <strong className="text-cyan-300">💡 İçgörü Gecesi (10%)</strong>
                          <p className="text-gray-300">Herkes ipucu alır</p>
                        </div>
                        <div className="bg-orange-800/30 p-2 rounded">
                          <strong className="text-orange-300">🌪️ Kaos Gecesi (8%)</strong>
                          <p className="text-gray-300">Gizemli adam iki kez değişir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-center">
                    <strong className="text-purple-300">💡 Strateji İpucu:</strong> 
                    <span className="text-gray-300"> Gece olaylarını takip edin! Bazı olaylar belirli rolleri güçlendirirken, diğerleri kısıtlar.</span>
                  </div>
                </div>

                {/* İpucu Sistemi */}
                <div className="bg-gradient-to-r from-cyan-900/50 to-teal-900/50 p-6 rounded-xl border border-cyan-500/30 mb-8">
                  <h3 className="font-bold text-2xl mb-6 text-cyan-300 text-center">🔍 İPUCU SİSTEMİ</h3>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-300 mb-2 text-lg">📍 Konum İpuçları</h4>
                        <p className="text-gray-300 mb-2">Oyuncuların bulunduğu yerlerle ilgili</p>
                        <div className="text-xs text-blue-400 grid grid-cols-2 gap-1">
                          <span>• Ev</span>
                          <span>• Mutfak</span>
                          <span>• Yatak Odası</span>
                          <span>• Bahçe</span>
                          <span>• Çalışma Odası</span>
                          <span>• Bodrum</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-300 mb-2 text-lg">👁️ Görsel İpuçları</h4>
                        <p className="text-gray-300 mb-2">Oyuncuların görsel özellikleriyle ilgili</p>
                        <div className="text-xs text-purple-400 grid grid-cols-2 gap-1">
                          <span>• Gözlük</span>
                          <span>• Şapka</span>
                          <span>• Siyah Ayakkabı</span>
                          <span>• Kırmızı Gömlek</span>
                          <span>• Uzun Saç</span>
                          <span>• Yüzük</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-red-300 mb-2 text-lg">⚠️ Sahte İpuçları</h4>
                        <p className="text-gray-300 mb-2">Yanıltıcı veya sahte olabilir</p>
                        <p className="text-xs text-red-400">%30 ihtimalle aldatıcı roller sahte ipuçları oluşturur</p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-yellow-300 mb-2 text-lg">💡 Strateji</h4>
                        <p className="text-gray-300 mb-2">İpuçlarını oyuncu bilgileriyle karşılaştırın</p>
                        <p className="text-xs text-yellow-400">Konum ve görsel bilgiler lobby'de gösterilir</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strateji Rehberi */}
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-xl border border-indigo-500/30">
                  <h3 className="font-bold text-2xl mb-6 text-indigo-300 text-center">💡 STRATEJİ REHBERİ</h3>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-bold text-green-300 text-lg mb-3">👼 İyi Takım İçin</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-purple-300">🔎 Dedektif:</strong> İpuçlarını birleştir, diğer oyuncuları gözlemle</p>
                        <p><strong className="text-blue-300">🕵️ Casus:</strong> Gizlice yardım et, belli etme</p>
                        <p><strong className="text-cyan-300">🛡️ Güvenlik:</strong> Dedektifi koru, strateji yap</p>
                        <p><strong className="text-gray-300">😇 Diğer İyi Roller:</strong> Dedektife güven, mantıklı oy ver</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-red-300 text-lg mb-3">😈 Kötü Takım İçin</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-red-300">🔪 Katil:</strong> Tüm iyi takımı hedefle, strateji yap</p>
                        <p><strong className="text-pink-300">🧛 Kan Emici:</strong> Katili koru, hipnotize et</p>
                        <p><strong className="text-orange-300">🎭 Manipülatör:</strong> Oyları yönlendir</p>
                        <p><strong className="text-yellow-300">💥 Sabotajcı:</strong> Oylamaları boz</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-purple-300 text-lg mb-3">🔮 Nötr Takım İçin</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-indigo-300">🧙 Gizemli Adam:</strong> Her tur yeni role adapte ol</p>
                        <p><strong className="text-gray-300">🛡️ Hayatta Kalan:</strong> Dikkat çekme, hayatta kal</p>
                        <p><strong className="text-purple-300">🌪️ Kaos Ustası:</strong> Rolleri değiştir</p>
                        <p><strong className="text-pink-300">🎪 Şöhret Avcısı:</strong> Dikkat çek, oy topla</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-center">
                    <p className="text-yellow-300 font-bold">🎯 Genel Strateji:</p>
                    <p className="text-gray-300">Rolleri gizli tut, blöf yap, gözlemle ve mantıklı hareket et!</p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-orange-900/80 to-red-900/80 p-4 border-t border-orange-500/30">
                <div className="text-center">
                <button
                  onClick={() => setShowRules(false)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg"
                >
                    ✅ Anladım, Oyuna Başlayalım!
                </button>
              </div>
              </div>

            </div>
          </div>
        )}

        {/* Roller Modalı - Büyük Ekran */}
        {showRoles && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRoles(false)}>
            <div className="w-full max-w-7xl max-h-[95vh] bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 p-6 border-b border-purple-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      🎭 TÜM ROLLER
                    </h2>
                    <p className="text-gray-300 text-lg">Ters Dedektif: Katili Bul - Detaylı Rol Rehberi</p>
                  </div>
                  <button
                    onClick={() => setShowRoles(false)}
                    className="text-gray-400 hover:text-white text-3xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6">
                
                {/* Takım Kategorileri */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* İyi Takım */}
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-6 rounded-xl border border-green-500/30">
                    <div className="text-center mb-6">
                      <h3 className="text-3xl font-bold text-green-300 mb-2">👼 İYİ TAKIM</h3>
                      <p className="text-green-200">Katili bulmaya çalışır</p>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(ROLES).filter(([key, role]) => role.team === 'good').map(([key, role], index) => (
                        <div key={key} className="bg-green-900/30 p-4 rounded-lg border-l-4 border-green-500 hover:bg-green-900/50 transition-all animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-white">{role.name}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white">
                              👼 İyi
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{role.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kötü Takım */}
                  <div className="bg-gradient-to-br from-red-900/40 to-rose-900/40 p-6 rounded-xl border border-red-500/30">
                    <div className="text-center mb-6">
                      <h3 className="text-3xl font-bold text-red-300 mb-2">😈 KÖTÜ TAKIM</h3>
                      <p className="text-red-200">Yakalanmamaya çalışır</p>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(ROLES).filter(([key, role]) => role.team === 'evil').map(([key, role], index) => (
                        <div key={key} className="bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500 hover:bg-red-900/50 transition-all animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-white">{role.name}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-red-600 text-white">
                              😈 Kötü
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{role.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nötr Takım */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-6 rounded-xl border border-purple-500/30">
                    <div className="text-center mb-6">
                      <h3 className="text-3xl font-bold text-purple-300 mb-2">🔮 NÖTR TAKIM</h3>
                      <p className="text-purple-200">Kendine özel hedefleri var</p>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(ROLES).filter(([key, role]) => role.team === 'neutral').map(([key, role], index) => (
                        <div key={key} className="bg-purple-900/30 p-4 rounded-lg border-l-4 border-purple-500 hover:bg-purple-900/50 transition-all animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-white">{role.name}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-600 text-white">
                              🔮 Nötr
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{role.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rol Sistemi Açıklaması */}
                <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-6 rounded-xl border border-yellow-500/30 mb-8">
                  <h3 className="font-bold text-2xl mb-4 text-yellow-300 text-center">🎯 ROL SİSTEMİ NASIL ÇALIŞIR?</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-green-300 mb-2">✅ Temel Roller (Her Oyunda)</h4>
                        <p className="text-sm text-gray-300 mb-2">Bu 6 rol her oyunda mutlaka bulunur:</p>
                        <div className="text-xs text-green-400">
                          Dedektif, Casus, Güvenlik, Masum, Gölge, Katil
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-300 mb-2">🎲 Rastgele Roller</h4>
                        <p className="text-sm text-gray-300 mb-2">Her oyunda 2-3 ekstra rol rastgele seçilir</p>
                        <p className="text-xs text-purple-400">Hangi rollerin aktif olduğu lobby'de gösterilir</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-300 mb-2">⚖️ Oyuncu Sayısına Göre</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                          <p><strong>4-5 kişi:</strong> 1 Katil + 2-3 rastgele rol</p>
                          <p><strong>6-8 kişi:</strong> 1 Katil + 1 Kan Emici + 2-3 rastgele rol</p>
                          <p><strong>9+ kişi:</strong> 2 Katil + 1 Kan Emici + 2-3 rastgele rol</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-orange-300 mb-2">🎮 Strateji</h4>
                        <p className="text-xs text-gray-300">
                          Rollerin gizli tutulması gerekir. Davranışlarınızla rolünüzü belli etmeyin!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detaylı Strateji Rehberi */}
                <div className="bg-gradient-to-r from-cyan-900/50 to-teal-900/50 p-6 rounded-xl border border-cyan-500/30">
                  <h3 className="font-bold text-2xl mb-6 text-cyan-300 text-center">💡 DETAYLI STRATEJİ REHBERİ</h3>
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* İyi Takım Stratejileri */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-green-300 text-lg mb-3">👼 İyi Takım Stratejileri</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-blue-300">🔎 Dedektif:</strong> İpuçlarını analiz et, iyi takıma güven, kendini gizle</p>
                        <p><strong className="text-green-300">🕵️ Casus:</strong> Katili bil ama belli etme, gizlice yönlendir</p>
                        <p><strong className="text-cyan-300">🛡️ Güvenlik:</strong> Dedektifi koru, strateji ile koruma yap</p>
                        <p><strong className="text-purple-300">🔬 Adli Tıpçı:</strong> Ölü rolleri öğren, bilgiyi akıllıca paylaş</p>
                        <p><strong className="text-pink-300">🧠 Psikolog:</strong> Sorgu sonuçlarını dikkatli değerlendir</p>
                        <p><strong className="text-blue-300">👥 İkizler:</strong> Koordineli çalış, çift oy gücünü sakla</p>
                        <p><strong className="text-orange-300">🪞 Yansıtıcı:</strong> Tek kullanımlık gücünü doğru zamanda kullan</p>
                        <p><strong className="text-gray-300">😇 Masum/Gölge:</strong> Dedektife yardım et, mantıklı oy ver</p>
                      </div>
                    </div>

                    {/* Kötü Takım Stratejileri */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-red-300 text-lg mb-3">😈 Kötü Takım Stratejileri</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-red-300">🔪 Katil:</strong> Tüm iyi takımı hedefle, dedektifi bul</p>
                        <p><strong className="text-red-300">🧛 Kan Emici:</strong> Katili koru, hipnotize et, oy gücü çal</p>
                        <p><strong className="text-orange-300">🎭 Manipülatör:</strong> Oyları yönlendir, kaos çıkar</p>
                        <p><strong className="text-amber-300">🎯 Taklitçi Katil:</strong> Dikkat çek, gerçek katili koru</p>
                        <p><strong className="text-yellow-300">💥 Sabotajcı:</strong> Oylamaları boz, karışıklık çıkar</p>
                        <p><strong className="text-blue-300">🕵️ Yalancı Dedektif:</strong> Sahte ipuçları ver, yanılt</p>
                      </div>
                    </div>

                    {/* Nötr Takım Stratejileri */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-purple-300 text-lg mb-3">🔮 Nötr Takım Stratejileri</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-indigo-300">🧙 Gizemli Adam:</strong> Her tur yeni role adapte ol</p>
                        <p><strong className="text-gray-300">🛡️ Hayatta Kalan:</strong> Dikkat çekme, hayatta kal</p>
                        <p><strong className="text-purple-300">🌪️ Kaos Ustası:</strong> Rolleri değiştir, kaos çıkar</p>
                        <p><strong className="text-pink-300">🎪 Şöhret Avcısı:</strong> Dikkat çek, oy topla</p>
                        <p><strong className="text-cyan-300">🕵️ İkili Ajan:</strong> Takım seç, strateji yap</p>
                        <p><strong className="text-violet-300">🔮 Sezici:</strong> Bilgileri akıllıca kullan</p>
                        <p><strong className="text-slate-300">🌑 Gölge Koruyucu:</strong> Gizli koruma yap</p>
                        <p><strong className="text-teal-300">📊 Strateji Uzmanı:</strong> Davranışları analiz et</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 p-4 border-t border-purple-500/30">
                <div className="text-center">
                  <button
                    onClick={() => setShowRoles(false)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg"
                  >
                    ✅ Anladım, Oyuna Dön!
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    )
  }

  // Bağlantı durumu kontrolü
  if (connectionStatus === 'game_not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">❌ Oyun Bulunamadı</h2>
          <p className="mb-4">Bu oda kodu geçersiz veya oyun sona ermiş.</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors"
          >
            Ana Menüye Dön
          </button>
        </div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center relative">
        <ParticleEffect />
        <div className="text-center animate-fadeIn">
          <div className="loading-spinner mb-6"></div>
          <p className="text-xl text-glow">Oyun yükleniyor...</p>
        </div>
      </div>
    )
  }

  const alivePlayers = players.filter(p => p.isAlive)
  const deadPlayers = players.filter(p => !p.isAlive)
  // İpuçları sadece dedektife gösterilir
  const clues = (myRole === 'DETECTIVE' && gameData.detectiveClues && gameData.detectiveClues[playerId]) 
    ? Object.values(gameData.detectiveClues[playerId]) 
    : []
  const currentTurnDeadPlayers = deadPlayers.filter(p => p.turnDied === gameData.turn)

  return (
    <div className="min-h-screen text-white relative">
      <ParticleEffect />
      
      {/* Geri butonu - Sol üst */}
      <button
        onClick={goBackToHome}
        className="back-button"
      >
        ← Ana Sayfa
      </button>

      {/* Bağlantı durumu göstergesi */}
      <div className={`connection-status ${firebaseConnected ? 'connected' : 'disconnected'}`}>
        <div className={`w-2 h-2 rounded-full inline-block mr-2 ${
          firebaseConnected ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
        {firebaseConnected ? '🟢 Bağlı' : '🔴 Bağlantı Yok'}
      </div>

      {/* Gece olayı göstergesi - Sol üst */}
      {gameData && gameData.currentNightEvent && (
        <div className="fixed top-16 left-4 bg-purple-900/90 backdrop-blur-sm p-3 rounded-lg border border-purple-500/50 z-40 max-w-xs">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{gameData.currentNightEvent.name.split(' ')[0]}</span>
            <div>
              <p className="text-purple-300 font-bold text-sm">{gameData.currentNightEvent.name}</p>
              <p className="text-gray-300 text-xs">{gameData.currentNightEvent.description}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state - gameData yüklenene kadar */}
      {!gameData ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">🔄</div>
            <h2 className="text-2xl font-bold mb-2">Oyun verisi yükleniyor...</h2>
            <p className="text-gray-400">Oda kodu: <code className="text-purple-300">{gameRoomId}</code></p>
            <div className="mt-4">
              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30 max-w-md mx-auto">
                <p className="text-sm text-yellow-200">
                  ⏳ Firebase'den oyun verisi alınıyor...
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  <div>🔗 Firebase bağlı: {firebaseConnected ? '✅ Evet' : '❌ Hayır'}</div>
                  <div>🏠 Oda ID: {gameRoomId}</div>
                  <div>👤 Oyuncu ID: {playerId}</div>
                  <div>📊 gameData: {gameData ? '✅ Var' : '❌ Yok'}</div>
                  <div>📡 Bağlantı durumu: {connectionStatus}</div>
                </div>
                {!firebaseConnected && (
                  <p className="text-sm text-red-300 mt-2">
                    ⚠️ Firebase bağlantısı yok! İnternet bağlantınızı kontrol edin.
                  </p>
                )}
                {connectionStatus === 'game_not_found' && (
                  <p className="text-sm text-red-300 mt-2">
                    ❌ Oyun odası bulunamadı! Oda kodu geçersiz olabilir.
                  </p>
                )}
                {connectionStatus === 'error' && (
                  <p className="text-sm text-red-300 mt-2">
                    🚨 Firebase bağlantı hatası! Console'u kontrol edin.
                  </p>
                )}
              </div>
              
              {/* Debug: Manuel yenileme butonu */}
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  🔄 Sayfayı Yenile
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-8 animate-fadeIn">
            <h1 className="main-title text-4xl md:text-5xl mb-4">🔪 TERS DEDEKTİF</h1>
            
            {/* Oyun fazı göstergesi */}
            <div className="phase-indicator">
              <div className="text-lg font-bold">
                            {gamePhase === GAME_PHASES.LOBBY && '🏠 Lobby'}
            {gamePhase === GAME_PHASES.ROLE_REVEAL && '🎭 Rol Açıklama'}
            {gamePhase === GAME_PHASES.SECURITY && '🛡️ Güvenlik Fazı'}
            {gamePhase === GAME_PHASES.FORENSIC && '🔬 Adli Tıp Fazı'}
            {gamePhase === GAME_PHASES.PSYCHOLOGIST && '🧠 Psikolog Fazı'}
            {gamePhase === GAME_PHASES.VAMPIRE && '🧛 Kan Emici Fazı'}
            {gamePhase === GAME_PHASES.MANIPULATOR && '🧠 Manipülatör Fazı'}
            {gamePhase === GAME_PHASES.SHADOW_GUARDIAN && '🛡️ Gölge Koruyucu Fazı'}
            {gamePhase === GAME_PHASES.SABOTEUR && '🔒 Sabotajcı Fazı'}
            {gamePhase === GAME_PHASES.ANALYST && '🎓 Strateji Uzmanı Fazı'}
            {gamePhase === GAME_PHASES.INTUITIVE && '🔮 Sezici Fazı'}
            {gamePhase === GAME_PHASES.DOUBLE_AGENT && '🐍 İkili Ajan Fazı'}
            {gamePhase === GAME_PHASES.CHAOS_AGENT && '🃏 Kaos Ustası Fazı'}
            {gamePhase === GAME_PHASES.NIGHT && '🌙 Gece Fazı'}
            {gamePhase === GAME_PHASES.DAY && '☀️ Gündüz Fazı'}
            {gamePhase === GAME_PHASES.DISCUSSION && '💬 Tartışma Fazı'}
            {gamePhase === GAME_PHASES.VOTING && '🗳️ Oylama Fazı'}
            {gamePhase === GAME_PHASES.FINAL_GUESS && '🎯 Son Tahmin'}
            {gamePhase === GAME_PHASES.GAME_OVER && '🎉 Oyun Bitti'}
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-6 text-sm animate-slideInLeft">
              <span className="bg-slate-800/50 px-4 py-2 rounded-full border border-purple-500/50 animate-glow">
                🏠 Oda: <code className="text-purple-300 font-bold text-lg tracking-wider">{gameRoomId}</code>
              </span>
              <span className="bg-slate-800/50 px-3 py-2 rounded-full border border-slate-600/50">
                Oyuncular: <span className="text-blue-300 font-bold">{players.length}</span>
              </span>
              {myRole && (
                <span className="bg-slate-800/50 px-3 py-2 rounded-full border border-slate-600/50">
                  Rolünüz: <span className="text-yellow-300 font-bold">{ROLES[myRole]?.name}</span>
                </span>
              )}
            </div>
          </header>

          {/* Lobby */}
          {gamePhase === GAME_PHASES.LOBBY && (
            <div className="max-w-4xl mx-auto">
              <div className="card animate-scaleIn">
                <h2 className="text-3xl font-bold mb-6 text-center text-glow">🏠 Oyun Lobisi</h2>
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-blue-300">👥 Oyuncular ({players.length}):</h3>
                  <div className="players-grid">
                    {players.map((player, index) => (
                      <div key={player.id} className={`player-card player-card-enter ${player.isHost ? 'host' : ''}`} style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">{player.name}</span>
                          {player.isHost && <span className="text-yellow-400 text-sm font-bold">👑 Host</span>}
                        </div>
                        {player.id === playerId && (
                          <div className="text-green-400 text-sm mt-1">✨ Bu sizsiniz</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {gameData && gameData.activeRandomRoles && (
                  <div className="mb-8 animate-fadeIn">
                    <h3 className="text-xl font-bold mb-4 text-purple-300">🎲 Bu Oyundaki Ekstra Roller:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {gameData.activeRandomRoles.map((role, index) => (
                        <div key={role} className="bg-gradient-to-r from-purple-700/50 to-purple-800/50 p-3 rounded-xl text-center border border-purple-500/30 animate-scaleIn" style={{animationDelay: `${index * 0.2}s`}}>
                          <div className="font-bold text-sm">{ROLES[role]?.name}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-purple-900/30 p-4 rounded-xl mt-4 border border-purple-500/20">
                      <p className="text-sm text-purple-200 text-center">
                        ℹ️ Bu roller oyunda var ama kimde olduğu bilinmiyor - Sürpriz element!
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {isHost ? (
                  <button
                    onClick={() => {
                      console.log('🔥 Oyun başlat butonuna tıklandı!')
                      console.log('Buton durumu:', { isHost, playersLength: players.length, gameRoomId, playerId })
                      console.log('Buton disabled mi?', players.length < 6)
                      console.log('gameData var mı?', !!gameData)
                      startGame()
                    }}
                    disabled={players.length < 6}
                      className={`w-full text-xl ${players.length < 6 ? 'btn-ghost cursor-not-allowed opacity-50' : 'btn-success animate-pulse-custom'}`}
                  >
                    {players.length < 6 ? `Oyunu Başlat (${players.length}/6)` : '🎮 Oyunu Başlat'}
                  </button>
                  ) : (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50 animate-pulse-custom">
                      <div className="text-2xl mb-2">⏳</div>
                      <p className="text-gray-300">Host oyunu başlatmasını bekliyorsunuz...</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* Rol Açıklama */}
          {gamePhase === GAME_PHASES.ROLE_REVEAL && (
            <div className="max-w-3xl mx-auto">
              <div className="card text-center animate-scaleIn">
                <h2 className="text-3xl font-bold mb-6 text-glow">🎭 ROL AÇIKLAMA</h2>
                
                {myRole && (
                  <div className="role-card role-reveal mb-8">
                    <div className="text-4xl mb-4 animate-bounce-custom">{ROLES[myRole].name.split(' ')[0]}</div>
                    <h3 className="text-3xl font-bold mb-4 text-glow">{ROLES[myRole].name}</h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">{ROLES[myRole].description}</p>
                    
                    {/* Konum ve sembol bilgileri */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-xl mb-6 border border-blue-500/30 animate-slideInLeft">
                      <h4 className="font-bold text-blue-300 mb-4 text-xl">📍 Kişisel Bilgileriniz</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/20">
                          <p className="text-sm text-blue-400 mb-2">📍 Bulunduğunuz Yer:</p>
                          <p className="font-bold text-white text-lg">{gameData.players[playerId]?.location}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-purple-500/20">
                          <p className="text-sm text-purple-400 mb-2">👁️ Görsel Özelliğiniz:</p>
                          <p className="font-bold text-white text-lg">{gameData.players[playerId]?.visualSymbol}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-900/20 p-3 rounded-lg mt-4 border border-yellow-500/30">
                        <p className="text-sm text-yellow-200">
                          ℹ️ Bu bilgiler ipuçlarında kullanılabilir. Akılda tutun!
                        </p>
                      </div>
                    </div>
                    
                    {/* Casus için özel bilgi */}
                    {myRole === 'SPY' && (
                      <div className="bg-red-900 p-4 rounded-lg">
                        <p className="font-bold text-red-300">🕵️ Gizli Bilgi:</p>
                        <p>Katil: <span className="font-bold">
                          {players.find(p => p.role === 'KILLER')?.name}
                        </span></p>
                        <p className="text-sm text-gray-400 mt-2">
                          ⚠️ Bu bilgiyi kimseyle paylaşmayın! Gizlice dedektife yardım edin.
                        </p>
                      </div>
                    )}
                    
                    {/* Katil için önemli uyarı */}
                    {myRole === 'KILLER' && (
                      <div className="bg-orange-900 p-4 rounded-lg">
                        <p className="font-bold text-orange-300">⚠️ Önemli Uyarı:</p>
                        <p className="text-sm text-gray-300">
                          Dedektifin kim olduğunu bilmiyorsunuz! Herkesten şüphelenin ve dikkatli olun.
                          İpuçları sadece dedektife görünür, bu yüzden kim ipucu aldığını gözlemleyin.
                        </p>
                  </div>
                )}

                    {/* Kan Emici için özel bilgi */}
                    {myRole === 'VAMPIRE' && (
                      <div className="bg-red-900 p-4 rounded-lg">
                        <p className="font-bold text-red-300">🧛 Gizli Bilgi:</p>
                        <p>Katil: <span className="font-bold">
                          {players.find(p => p.role === 'KILLER')?.name}
                        </span></p>
                        <p className="text-sm text-gray-400 mt-2">
                          ⚠️ Katil ölse bile bir gece daha hayatta kalabilirsiniz! Kaos yaratın ve dedektifi yanıltın.
                        </p>
                      </div>
                    )}

                    {/* İkizler için özel bilgi */}
                    {myRole === 'TWINS' && (
                      <div className="bg-blue-900 p-4 rounded-lg">
                        <p className="font-bold text-blue-300">👥 İkiz Bilgisi:</p>
                        <p>İkiz kardeşiniz: <span className="font-bold">
                          {players.find(p => p.id === gameData.players[playerId]?.twinId)?.name}
                        </span></p>
                        <p className="text-sm text-gray-400 mt-2">
                          ⚠️ İkiz kardeşiniz ölürse, bir kereye mahsus çift oy kullanabilirsiniz!
                        </p>
                      </div>
                    )}

                    {/* Gizemli Adam için uyarı */}
                    {myRole === 'MYSTERIOUS' && (
                      <div className="bg-purple-900 p-4 rounded-lg">
                        <p className="font-bold text-purple-300">🧙 Gizemli Güç:</p>
                        <p className="text-sm text-gray-300">
                          Her tur farklı bir rol alırsınız! Mevcut rolünüz: 
                          <span className="font-bold ml-1">
                            {ROLES[gameData.players[playerId]?.mysteriousCurrentRole]?.name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          ⚠️ Rolünüz her gece değişir. Sistem size bildirecek.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center">
                  {isHost ? (
                  <button
                    onClick={nextPlayerRole}
                      className="btn-primary text-xl animate-glow"
                  >
                      ⚡ Oyuna Başla
                  </button>
                  ) : (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50 animate-pulse-custom">
                      <div className="text-2xl mb-2">⏳</div>
                      <p className="text-gray-300">Host oyunu başlatmasını bekliyor...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Adli Tıpçı Fazı */}
          {gamePhase === GAME_PHASES.FORENSIC && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🔬 ADLİ TIPÇI - Tur {gameData.turn}</h2>
                
                {myRole === 'FORENSIC' ? (
                  <div>
                    <div className="bg-blue-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-blue-300">🔬 Adli Tıp İncelemesi:</p>
                      <p className="text-sm text-gray-400">
                        Ölen bir oyuncunun rolünü öğrenebilirsiniz. Bu bilgiyi gizli tutun ve sözlü yönlendirme yapın.
                      </p>
                  </div>
                    
                    {/* Ölen oyuncuları göster */}
                    <div className="space-y-2">
                      {deadPlayers.filter(p => p.turnDied === gameData.turn).map(player => (
                        <button
                          key={player.id}
                          onClick={() => investigateDeadPlayer(player.id)}
                          className="block w-full p-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          🔬 {player.name}'i incele
                        </button>
                      ))}
                      
                      {deadPlayers.filter(p => p.turnDied < gameData.turn).length > 0 && (
                        <>
                          <div className="text-sm text-gray-400 mt-4 mb-2">Önceki turlardan ölenler:</div>
                          {deadPlayers.filter(p => p.turnDied < gameData.turn).map(player => (
                            <button
                              key={player.id}
                              onClick={() => investigateDeadPlayer(player.id)}
                              className="block w-full p-3 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                            >
                              🔬 {player.name}'i incele (Tur {player.turnDied})
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {/* Adli tıpçının önceki bulguları */}
                    {gameData.forensicInfo && gameData.forensicInfo[playerId] && (
                      <div className="mt-4 bg-green-900 p-3 rounded">
                        <p className="text-sm text-green-300 mb-2">🔬 Önceki İncelemeleriniz:</p>
                        {Object.values(gameData.forensicInfo[playerId]).map((info, index) => (
                          <div key={index} className="text-sm">
                            <strong>Tur {info.turn}:</strong> {info.deadPlayer} - {ROLES[info.role]?.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Adli tıpçı çalışıyor...</p>
                    <p className="text-sm text-gray-400">
                      Adli tıpçı ölen oyuncuları inceliyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🔬</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Psikolog Fazı */}
          {gamePhase === GAME_PHASES.PSYCHOLOGIST && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🧠 PSİKOLOG - Tur {gameData.turn}</h2>
                
                {myRole === 'PSYCHOLOGIST' ? (
                  <div>
                    <div className="bg-purple-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-purple-300">🧠 İlişki Analizi:</p>
                      <p className="text-sm text-gray-400">
                        İki oyuncu seçin ve aralarındaki güven/şüphe ilişkisini analiz edin.
                        {gameData.currentNightEvent?.id === 'empathy_night' && (
                          <span className="text-blue-300 block mt-1">💫 Empati gecesi: Üç kişilik grup analizi yapabilirsiniz!</span>
                        )}
                      </p>
                    </div>

                    {/* İki oyuncu seçimi için grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-purple-300 mb-2">1. Oyuncu Seçin:</h4>
                        <div className="space-y-1">
                          {alivePlayers.filter(p => p.role !== 'PSYCHOLOGIST').map(player => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedPlayer1(player.id)}
                              className={`block w-full p-2 text-sm rounded transition-colors ${
                                selectedPlayer1 === player.id 
                                  ? 'bg-purple-500 text-white' 
                                  : 'bg-gray-600 hover:bg-gray-500'
                              }`}
                            >
                              {player.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-purple-300 mb-2">2. Oyuncu Seçin:</h4>
                        <div className="space-y-1">
                          {alivePlayers.filter(p => p.role !== 'PSYCHOLOGIST' && p.id !== selectedPlayer1).map(player => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedPlayer2(player.id)}
                              className={`block w-full p-2 text-sm rounded transition-colors ${
                                selectedPlayer2 === player.id 
                                  ? 'bg-purple-500 text-white' 
                                  : 'bg-gray-600 hover:bg-gray-500'
                              }`}
                            >
                              {player.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Analiz butonu */}
                    {selectedPlayer1 && selectedPlayer2 && (
                      <button
                        onClick={() => analyzeRelationship(selectedPlayer1, selectedPlayer2)}
                        className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors mb-4"
                      >
                        🧠 {players.find(p => p.id === selectedPlayer1)?.name} ve {players.find(p => p.id === selectedPlayer2)?.name} ilişkisini analiz et
                      </button>
                    )}
                    
                    {/* Psikolog'un önceki analizleri */}
                    {gameData.psychologistInfo && gameData.psychologistInfo[playerId] && (
                      <div className="mt-4 bg-indigo-900 p-3 rounded">
                        <p className="text-sm text-indigo-300 mb-2">🧠 Önceki Analizleriniz:</p>
                        {Object.values(gameData.psychologistInfo[playerId]).map((info, index) => (
                          <div key={index} className="text-sm mb-2 p-2 bg-gray-700 rounded">
                            <strong>Tur {info.turn}:</strong> {info.player1} ↔ {info.player2}
                            <div className="text-xs text-gray-300 mt-1">{info.relationship}</div>
                            {info.analysisType === 'enhanced' && (
                              <span className="text-xs text-blue-300">💫 Empati analizi</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Psikolog ilişki analizi yapıyor...</p>
                    <p className="text-sm text-gray-400">
                      Psikolog oyuncular arasındaki dinamikleri inceliyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🧠</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kan Emici Fazı */}
          {gamePhase === GAME_PHASES.VAMPIRE && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🧛 KAN EMİCİ - Tur {gameData.turn}</h2>
                
                {myRole === 'VAMPIRE' ? (
                  <div>
                    <div className="bg-red-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-red-300">🧛 Hipnotik Güç:</p>
                      <p className="text-sm text-gray-400">
                        Bir kişiyi hipnotize edin. O kişinin oyu sizin belirlediğiniz hedefe gidecek.
                        {gameData.currentNightEvent?.id === 'full_moon' && (
                          <span className="text-purple-300 block mt-1">🌕 Dolunay etkisi: 2 kişiyi hipnotize edebilirsiniz!</span>
                        )}
                      </p>
                    </div>

                    {/* Hipnotize edilmiş oyuncuları göster */}
                    {gameData.hypnotizedPlayers && gameData.hypnotizedPlayers.filter(h => h.turn === gameData.turn).length > 0 && (
                      <div className="bg-purple-900 p-3 rounded mb-4">
                        <p className="text-sm text-purple-300 mb-2">🧛 Bu Gece Hipnotize Edilenler:</p>
                        {gameData.hypnotizedPlayers.filter(h => h.turn === gameData.turn).map((hypno, index) => (
                          <div key={index} className="text-sm text-white">
                            ✨ {hypno.playerName}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {alivePlayers.filter(p => p.role !== 'VAMPIRE' && p.role !== 'KILLER' && isRoleInGame(p.role)).map(player => (
                        <button
                          key={player.id}
                          onClick={() => hypnotizePlayer(player.id)}
                          className="block w-full p-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                        >
                          🧛 {player.name} hipnotize et
                        </button>
                      ))}
                    </div>

                    {/* Hipnotize sayısı bilgisi */}
                    <div className="mt-4 text-sm text-gray-400">
                      Hipnotize edilmiş: {gameData.hypnotizedPlayers?.filter(h => h.turn === gameData.turn).length || 0} / {gameData.currentNightEvent?.id === 'full_moon' ? 2 : 1}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Kan emici hipnotik güçlerini kullanıyor...</p>
                    <p className="text-sm text-gray-400">
                      Kan emici birini hipnotize ediyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🧛</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manipülatör Fazı */}
          {gamePhase === GAME_PHASES.MANIPULATOR && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🧠 MANİPÜLATÖR - Tur {gameData.turn}</h2>
                
                {myRole === 'MANIPULATOR' ? (
                  <div>
                    <div className="bg-purple-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-purple-300">🧠 Zihinsel Manipülasyon:</p>
                      <p className="text-sm text-gray-400">
                        Bir oyuncunun oyunu başka bir oyuncuya yönlendirin.
                        {gameData.currentNightEvent?.id === 'manipulation_night' && (
                          <span className="text-pink-300 block mt-1">🧠 Manipülasyon gecesi: 2 kişinin oyunu yönlendirebilirsiniz!</span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-bold mb-2">Hedef Oyuncu:</h3>
                        <div className="space-y-2">
                          {alivePlayers.filter(p => p.role !== 'MANIPULATOR' && isRoleInGame(p.role)).map(player => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedPlayer1(player.id)}
                              className={`block w-full p-2 rounded transition-colors text-sm ${
                                selectedPlayer1 === player.id
                                  ? 'bg-purple-600'
                                  : 'bg-gray-600 hover:bg-gray-500'
                              }`}
                            >
                              {player.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold mb-2">Yönlendirilecek:</h3>
                        <div className="space-y-2">
                          {alivePlayers.filter(p => p.id !== selectedPlayer1 && isRoleInGame(p.role)).map(player => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedPlayer2(player.id)}
                              className={`block w-full p-2 rounded transition-colors text-sm ${
                                selectedPlayer2 === player.id
                                  ? 'bg-pink-600'
                                  : 'bg-gray-600 hover:bg-gray-500'
                              }`}
                            >
                              {player.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedPlayer1 && selectedPlayer2 && (
                      <button
                        onClick={() => manipulateVote(selectedPlayer1, selectedPlayer2)}
                        className="w-full mt-4 p-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                      >
                        🧠 {players.find(p => p.id === selectedPlayer1)?.name}'in oyunu {players.find(p => p.id === selectedPlayer2)?.name}'e yönlendir
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Manipülatör zihinleri etkiliyor...</p>
                    <p className="text-sm text-gray-400">
                      Manipülatör oyları yönlendiriyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🧠</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gölge Koruyucu Fazı */}
          {gamePhase === GAME_PHASES.SHADOW_GUARDIAN && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🛡️ GÖLGE KORUYUCU - Tur {gameData.turn}</h2>
                
                {myRole === 'SHADOW_GUARDIAN' ? (
                  <div>
                    <div className="bg-gray-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-gray-300">🛡️ Gizli Koruma:</p>
                      <p className="text-sm text-gray-400">
                        Kimse bilmeyecek şekilde birini koruyun. Saldırı başarısız olursa sadece "biri korundu" denecek.
                        {gameData.currentNightEvent?.id === 'shadow_night' && (
                          <span className="text-blue-300 block mt-1">🌑 Gölge gecesi: 2 kişiyi koruyabilirsiniz!</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {alivePlayers.filter(p => p.role !== 'SHADOW_GUARDIAN' && isRoleInGame(p.role)).map(player => (
                        <button
                          key={player.id}
                          onClick={() => shadowProtect(player.id)}
                          className="block w-full p-3 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                        >
                          🛡️ {player.name} gizlice koru
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Gölgede biri çalışıyor...</p>
                    <p className="text-sm text-gray-400">
                      Gölge koruyucu gizlice hareket ediyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🌑</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sabotajcı Fazı */}
          {gamePhase === GAME_PHASES.SABOTEUR && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🔒 SABOTAJCI - Tur {gameData.turn}</h2>
                
                {myRole === 'SABOTEUR' ? (
                  <div>
                    <div className="bg-orange-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-orange-300">🔒 Oy Sabotajı:</p>
                      <p className="text-sm text-gray-400">
                        Bir oyuncunun oyunu geçersiz kılın (günde 1 kez kullanılır).
                        {gameData.currentNightEvent?.id === 'confusion_night' && (
                          <span className="text-red-300 block mt-1">😵 Kafa karışıklığı gecesi: 2 oyun geçersiz kılabilirsiniz!</span>
                        )}
                      </p>
                    </div>
                    
                    {!gameData.players[playerId]?.sabotageUsed ? (
                      <div className="space-y-2">
                        {alivePlayers.filter(p => p.role !== 'SABOTEUR' && isRoleInGame(p.role)).map(player => (
                          <button
                            key={player.id}
                            onClick={() => sabotageVote(player.id)}
                            className="block w-full p-3 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
                          >
                            🔒 {player.name}'in oyunu sabote et
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-700 rounded">
                        <p className="text-gray-300">Sabotaj gücünüzü bu oyunda zaten kullandınız.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Sabotajcı iş başında...</p>
                    <p className="text-sm text-gray-400">
                      Sabotajcı oyları manipüle ediyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🔒</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Güvenlik Fazı */}
          {gamePhase === GAME_PHASES.SECURITY && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🛡️ GÜVENLİK - Tur {gameData.turn}</h2>
                
                {myRole === 'SECURITY' ? (
                  <div>
                    <div className="bg-blue-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-blue-300">🛡️ Güvenlik Seçimi:</p>
                      <p className="text-sm text-gray-400">
                        Bu gece koruyacağınız kişiyi seçin. Katil o kişiyi öldüremeyecek.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {alivePlayers.filter(p => p.role !== 'SECURITY' && isRoleInGame(p.role)).map(player => (
                        <button
                          key={player.id}
                          onClick={() => protectPlayer(player.id)}
                          className="block w-full p-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          🛡️ {player.name} koru
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Güvenlik görevde...</p>
                    <p className="text-sm text-gray-400">
                      Güvenlik bu gece koruyacağı kişiyi seçiyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🛡️</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gece Fazı */}
          {gamePhase === GAME_PHASES.NIGHT && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🌙 GECE - Tur {gameData.turn}</h2>
                
                {myRole === 'KILLER' ? (
                  <div>
                    {/* Koruyucu gece kontrolü */}
                    {gameData.currentNightEvent && gameData.currentNightEvent.effect === 'protect_all' ? (
                      <div className="bg-blue-900 p-4 rounded-lg mb-4">
                        <p className="font-bold text-blue-300">👼 Koruyucu Gece!</p>
                        <p className="text-sm text-gray-400">
                          Mistik güçler çalışıyor, bu gece kimseyi öldüremezsiniz.
                        </p>
                      </div>
                    ) : (
                    <div className="bg-red-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-red-300">🔪 Katil Seçimi:</p>
                      <p className="text-sm text-gray-400">
                        {gameData.killerCount > 1 
                          ? `${gameData.killerCount} katil birlikte kurban seçiyor...`
                          : 'Kurbanınızı seçin'
                        }
                      </p>
                    </div>
                    )}

                    {/* Katil oyları göster */}
                    {gameData.killerVotes && Object.keys(gameData.killerVotes).length > 0 && (
                      <div className="bg-gray-700 p-3 rounded mb-4">
                        <p className="text-sm text-gray-300 mb-2">Katil Oyları:</p>
                        {Object.entries(
                          Object.values(gameData.killerVotes).reduce((acc, targetId) => {
                            acc[targetId] = (acc[targetId] || 0) + 1
                            return acc
                          }, {})
                        ).map(([targetId, count]) => {
                          const target = players.find(p => p.id === targetId)
                          return target ? (
                            <div key={targetId} className="text-sm">
                              {target.name}: {count} oy
                            </div>
                          ) : null
                        })}
                      </div>
                    )}
                    
                    {!(gameData.currentNightEvent && gameData.currentNightEvent.effect === 'protect_all') && (
                    <div className="space-y-2">
                      {alivePlayers.filter(p => p.role !== 'KILLER' && isRoleInGame(p.role)).map(player => (
                        <button
                          key={player.id}
                          onClick={() => killPlayer(player.id)}
                          className={`block w-full p-3 rounded transition-colors ${
                            gameData.killerVotes?.[playerId] === player.id
                              ? 'bg-red-500'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          💀 {player.name} öldür
                          {gameData.killerVotes?.[playerId] === player.id && ' ✓'}
                        </button>
                      ))}
                    </div>
                    )}

                    {gameData.killerCount > 1 && (
                      <div className="mt-4 text-sm text-gray-400">
                        Oyunuz: {gameData.killerVotes?.[playerId] 
                          ? players.find(p => p.id === gameData.killerVotes[playerId])?.name || 'Seçilmedi'
                          : 'Henüz oy vermediniz'
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Gece... Herkes uyuyor.</p>
                    <p className="text-sm text-gray-400">
                      {gameData.killerCount > 1 
                        ? `${gameData.killerCount} katil kurbanını seçiyor...`
                        : 'Katil kurbanını seçiyor...'
                      }
                    </p>
                    <div className="animate-pulse text-6xl mt-4">😴</div>
                    
                    {/* Debug: Host için gece fazını atla butonu */}
                    {isHost && (
                      <div className="mt-6">
                        <p className="text-xs text-gray-500 mb-2">Debug: Eğer katil hareket etmiyorsa</p>
                        <button
                          onClick={() => changeGamePhase(GAME_PHASES.DAY)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                        >
                          🌅 Gündüze Geç (Debug)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gündüz Fazı */}
          {gamePhase === GAME_PHASES.DAY && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">☀️ GÜNDÜZ - Tur {gameData.turn}</h2>
                
                {/* Gece sonucu */}
                {gameData.lastNightResult === 'protected' && (
                  <div className="bg-blue-900 p-4 rounded mb-4">
                    <p className="font-bold text-blue-300">🛡️ Bu gece kimse ölmedi!</p>
                    <p className="text-sm text-gray-400">Güvenlik başarıyla birini korudu.</p>
                  </div>
                )}
                
                {gameData.lastNightResult === 'reflected' && (
                  <div className="bg-purple-900 p-4 rounded mb-4">
                    <p className="font-bold text-purple-300">🪞 Saldırı geri döndü!</p>
                    <p className="text-sm text-gray-400">Yansıtıcı saldırıyı geri yansıttı.</p>
                  </div>
                )}

                {/* Gece olayı */}
                {gameData.currentNightEvent && (
                  <div className="night-event mb-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2 animate-bounce-custom">
                        {gameData.currentNightEvent.name.split(' ')[0]}
                      </div>
                      <p className="font-bold text-indigo-300 text-xl mb-2">{gameData.currentNightEvent.name}</p>
                      <p className="text-gray-300">{gameData.currentNightEvent.description}</p>
                    </div>
                  </div>
                )}
                
                {/* Ölen oyuncular */}
                {currentTurnDeadPlayers.map(player => (
                  <div key={player.id} className="bg-red-900 p-4 rounded mb-4">
                    <p className="font-bold">💀 {player.name} öldürüldü!</p>
                    <p className="text-sm">Rol: {ROLES[player.role]?.name}</p>
                  </div>
                ))}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">👥 Yaşayan Oyuncular ({alivePlayers.length})</h3>
                    <div className="space-y-2">
                      {alivePlayers.map(player => (
                        <div key={player.id} className="bg-gray-700 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                          <span className="font-bold">{player.name}</span>
                          {player.id === playerId && <span className="ml-2 text-green-400">(Siz)</span>}
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-blue-300">{player.location}</div>
                              <div className="text-yellow-300">{player.visualSymbol}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {deadPlayers.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-lg font-bold mb-2">💀 Ölenler ({deadPlayers.length})</h3>
                        <div className="space-y-1">
                          {deadPlayers.map(player => (
                            <div key={player.id} className="bg-red-800 p-2 rounded text-sm">
                              <div className="flex justify-between items-start">
                                <div>
                              <span>{player.name} - Tur {player.turnDied}</span>
                              {player.eliminatedByVote && <span className="ml-2 text-yellow-300">(Oylama)</span>}
                                </div>
                                <div className="text-right text-xs">
                                  <div className="text-blue-300">{player.location}</div>
                                  <div className="text-yellow-300">{player.visualSymbol}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {myRole === 'DETECTIVE' ? (
                      <>
                        <h3 className="text-xl font-bold mb-3">🔍 İpuçlarınız ({clues.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {clues.map((clue, index) => (
                        <div key={index} className={`clue-appear ${
                          clue.clueType === 'fake' ? 'clue-fake' : 
                          clue.clueType === 'location' ? 'clue-location' : 'clue-visual'
                        }`} style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-white">🔍 Tur {clue.turn}</strong>
                            <span className="text-xs px-2 py-1 rounded-full bg-black/20">
                              {clue.clueType === 'fake' ? '⚠️ Şüpheli' : 
                               clue.clueType === 'location' ? '📍 Konum' : '👁️ Görsel'}
                            </span>
                          </div>
                          <p className="font-medium">{clue.clue}</p>
                        </div>
                      ))}
                    </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold mb-3">🔍 İpuçları</h3>
                        <div className="bg-gray-700 p-4 rounded text-center">
                          <p className="text-gray-400">İpuçları sadece dedektifin görüntüleyebilir</p>
                          <p className="text-sm text-gray-500 mt-2">Dedektif ipuçlarını tartışma sırasında paylaşabilir</p>
                        </div>
                      </>
                    )}
                    
                    {/* Dedektif ipucu alabilir */}
                    {myRole === 'DETECTIVE' && currentTurnDeadPlayers.length > 0 && (
                      <div className="mt-4">
                        <div className="bg-blue-900 p-3 rounded mb-2">
                          <p className="text-sm font-bold text-blue-300">🔎 Dedektif İpucu Alma:</p>
                        </div>
                        {currentTurnDeadPlayers.map(player => (
                          <button
                            key={player.id}
                            onClick={() => addClue(player.id)}
                            className="block w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors mb-1"
                          >
                            🔍 {player.name}'den ipucu al
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isHost && (
                  <button
                    onClick={() => changeGamePhase(GAME_PHASES.DISCUSSION)}
                    className="w-full mt-6 p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition-colors"
                  >
                    🗣️ Tartışma Başlat
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tartışma Fazı */}
          {gamePhase === GAME_PHASES.DISCUSSION && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🗣️ TARTIŞMA ZAMANI</h2>
                
                <div className="bg-yellow-900/30 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-yellow-300 mb-2">📋 Tartışma Kuralları:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Herkes şüphelerini paylaşabilir</li>
                    <li>• Dedektif kendini açık etmeden yönlendirme yapabilir</li>
                    <li>• Casus gizlice dedektife yardım etmelidir</li>
                    <li>• Katil dikkat çekmemeye çalışmalıdır</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">👥 Oyuncular</h3>
                    <div className="space-y-2">
                      {alivePlayers.map(player => (
                        <div key={player.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                          <span className="font-bold">{player.name}</span>
                          {player.id === playerId && <span className="text-green-400">(Siz)</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {myRole === 'DETECTIVE' ? (
                      <>
                        <h3 className="text-xl font-bold mb-3">🔍 İpuçlarınız</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {clues.map((clue, index) => (
                            <div key={index} className={`p-3 rounded text-sm ${
                              clue.clueType === 'fake' ? 'bg-red-900/50' : 
                              clue.clueType === 'location' ? 'bg-blue-900/50' : 'bg-purple-900/50'
                            }`}>
                              <div className="flex justify-between items-start mb-1">
                                <strong>Tur {clue.turn}</strong>
                                <span className="text-xs">
                                  {clue.clueType === 'fake' ? '⚠️ Şüpheli' : 
                                   clue.clueType === 'location' ? '📍 Konum' : '👁️ Görsel'}
                                </span>
                              </div>
                              <p>{clue.clue}</p>
                          {clue.detective && (
                            <p className="text-blue-300 text-xs mt-1">
                              - Dedektif {clue.detective}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold mb-3">🔍 İpuçları</h3>
                        <div className="bg-gray-700 p-4 rounded text-center">
                          <p className="text-gray-400">İpuçları sadece dedektife görünür</p>
                          <p className="text-sm text-gray-500 mt-2">Dedektif bu bilgileri sizinle paylaşabilir</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 bg-purple-900/30 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-300 mb-2">💭 Rol Bazlı İpuçları:</h3>
                  {myRole === 'DETECTIVE' && (
                    <p className="text-sm text-blue-300">
                      🔎 Dedektif: İpuçlarınızı kullanarak diğer oyuncuları yönlendirin, ama kendinizi açık etmeyin!
                    </p>
                  )}
                  {myRole === 'SPY' && (
                    <p className="text-sm text-green-300">
                      🕵️ Casus: Katili biliyorsunuz! Dedektife gizlice yardım edin ama çok destekleyici olmayın.
                    </p>
                  )}
                  {myRole === 'KILLER' && (
                    <p className="text-sm text-red-300">
                      🔪 Katil: Sessiz kalın, dikkat çekmeyin. Şüpheleri başkalarına yönlendirin.
                    </p>
                  )}
                  {myRole === 'SHADOW' && (
                    <p className="text-sm text-purple-300">
                      🌙 Gölge: Nötr rolsünüz. Hayatta kalmaya odaklanın. Son 3 kişide kalırsanız kazanırsınız!
                    </p>
                  )}
                </div>

                {isHost && (
                  <button
                    onClick={() => changeGamePhase(GAME_PHASES.VOTING)}
                    className="w-full mt-6 p-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
                  >
                    🗳️ Oylama Başlat
                  </button>
                )}

                {!isHost && (
                  <div className="text-center mt-6 text-gray-400">
                    Host oylama başlatmasını bekliyor...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Oylama Fazı */}
          {gamePhase === GAME_PHASES.VOTING && (
            <div className="max-w-2xl mx-auto">
              <div className="card animate-scaleIn">
                <h2 className="text-3xl font-bold mb-6 text-center text-glow">🗳️ OYLAMA ZAMANI</h2>
                
                {/* Süre göstergesi */}
                <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 p-4 rounded-xl mb-6 border border-red-500/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-red-300 font-bold">⏰ Kalan Süre:</span>
                    <span className={`text-2xl font-bold ${votingTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-orange-300'}`}>
                      {Math.floor(votingTimeLeft / 60)}:{(votingTimeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        votingTimeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                      }`}
                      style={{ width: `${(votingTimeLeft / 60) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 text-center">
                    Süre dolduğunda oylar otomatik sayılacak!
                  </p>
                </div>
                
                {/* Gece olayı - Panik gecesi */}
                {gameData.currentNightEvent && gameData.currentNightEvent.effect === 'disable_voting' && (
                  <div className="bg-yellow-900/50 p-4 rounded-lg mb-4 border border-yellow-500/30">
                    <p className="text-yellow-300 font-bold">😱 Panik Gecesi Etkisi!</p>
                    <p className="text-sm text-gray-400">Köy halkı çok panikte, bu tur kimse oy kullanamıyor. Tartışma devam ediyor.</p>
                  </div>
                )}
                
                {/* Ölen oyuncular oy veremez uyarısı */}
                {gameData.players[playerId] && !gameData.players[playerId].isAlive && (
                  <div className="bg-red-900/50 p-4 rounded-lg mb-4 border border-red-500/30">
                    <p className="text-red-300 font-bold">💀 Ölen oyuncular oy veremez!</p>
                    <p className="text-sm text-gray-400">Diğer oyuncuların oylama yapmasını izleyebilirsiniz.</p>
                  </div>
                )}
                
                {gameData.players[playerId] && gameData.players[playerId].isAlive && !hasVoted && (
                  <p className="mb-4 text-gray-300 text-center text-lg">Kimi elemeye oyluyorsunuz?</p>
                )}
                
                {hasVoted && (
                  <div className="bg-green-900/50 p-4 rounded-lg mb-4 border border-green-500/30">
                    <p className="text-green-300 font-bold text-center">✅ Oyunuz kaydedildi!</p>
                    <p className="text-sm text-gray-400 text-center">Diğer oyuncuların oy vermesini bekliyorsunuz...</p>
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  {alivePlayers.map(player => (
                    <div key={player.id} className="space-y-2">
                    <button
                      onClick={() => votePlayer(player.id)}
                        disabled={
                          hasVoted ||
                          !gameData.players[playerId] || 
                          !gameData.players[playerId].isAlive ||
                          (gameData.currentNightEvent && gameData.currentNightEvent.effect === 'disable_voting')
                        }
                        className={`w-full p-4 rounded-xl transition-all duration-300 text-left transform hover:scale-105 ${
                        gameData.votes?.[playerId] === player.id
                            ? 'bg-gradient-to-r from-red-600 to-red-700 border border-red-500 shadow-lg shadow-red-500/30'
                            : hasVoted
                            ? 'bg-gray-800 cursor-not-allowed opacity-50'
                            : gameData.players[playerId] && 
                              gameData.players[playerId].isAlive && 
                              !(gameData.currentNightEvent && gameData.currentNightEvent.effect === 'disable_voting')
                            ? 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-600 hover:border-purple-500/50'
                            : 'bg-gray-800 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">{player.name}</span>
                          {player.id === playerId && <span className="text-green-400 font-semibold">(Siz)</span>}
                          {gameData.votes?.[playerId] === player.id && <span className="text-red-300">✓ Seçildi</span>}
                        </div>
                    </button>
                      
                      {/* İkiz çift oy butonu */}
                      {gameData.players[playerId] && 
                       gameData.players[playerId].isAlive && 
                       gameData.players[playerId].role === 'TWINS' && 
                       !gameData.players[playerId].doubleVoteUsed &&
                       gameData.players[gameData.players[playerId].twinId] &&
                       !gameData.players[gameData.players[playerId].twinId].isAlive && 
                       !hasVoted && (
                        <button
                          onClick={() => useDoubleVote(player.id)}
                          className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-sm transition-all duration-300 transform hover:scale-105 border border-blue-500/30"
                        >
                          👥 Çift Oy Ver (İkiz Gücü)
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Boş oy ve atlama seçenekleri */}
                  {gameData.players[playerId] && 
                   gameData.players[playerId].isAlive && 
                   !(gameData.currentNightEvent && gameData.currentNightEvent.effect === 'disable_voting') &&
                   !hasVoted && (
                    <div className="border-t border-gray-600 pt-4 space-y-3">
                      <button
                        onClick={voteSkip}
                        className="w-full p-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 rounded-xl transition-all duration-300 transform hover:scale-105 border border-yellow-500/30"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">🗳️ Boş Oy Ver</span>
                          <span className="text-sm opacity-80">Kimseyi seçmem</span>
                </div>
                      </button>
                      
                      <button
                        onClick={skipVoting}
                        className="w-full p-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">⏭️ Oylamayı Atla</span>
                          <span className="text-sm opacity-80">Oy kullanmam</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-600/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-300 font-semibold">📊 Oy Durumu:</span>
                    <span className="text-blue-300 font-bold text-lg">
                      {Object.keys(gameData.votes || {}).length} / {alivePlayers.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(Object.keys(gameData.votes || {}).length / alivePlayers.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Henüz oy vermedi: {alivePlayers.length - Object.keys(gameData.votes || {}).length}</span>
                    <span>Kalan süre: {Math.floor(votingTimeLeft / 60)}:{(votingTimeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {isHost && votingTimeLeft > 0 && (
                  <button
                    onClick={processVotes}
                    className="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 border border-red-500/30 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none disabled:border-gray-600"
                    disabled={Object.keys(gameData.votes || {}).length === 0}
                  >
                    ⚡ Oyları Hemen Say (Erken Bitir)
                  </button>
                )}

                {!isHost && (
                  <div className="text-center p-4 bg-slate-800/30 rounded-xl border border-slate-600/30">
                    <p className="text-gray-300">
                      {votingTimeLeft > 0 ? (
                        <>⏳ Süre dolmasını veya host'un erken bitirmesini bekliyorsunuz...</>
                      ) : (
                        <>⚡ Host oyları sayıyor...</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kaos Ustası Fazı */}
          {gamePhase === GAME_PHASES.CHAOS_AGENT && (
            <div className="max-w-2xl mx-auto">
              <div className="card animate-scaleIn">
                <h2 className="text-3xl font-bold mb-6 text-center text-glow">🃏 KAOS USTASI FAZI</h2>
                
                {myRole === 'CHAOS_AGENT' ? (
                  <div>
                    <div className="bg-purple-900/50 p-4 rounded-lg mb-6 border border-purple-500/30">
                      <h3 className="font-bold text-purple-300 mb-2">🃏 Kaos Gücünüz:</h3>
                      <p className="text-sm text-gray-300">
                        Bir oyuncunun rolünü rastgele değiştirebilirsiniz! Bu güç sadece bir kez kullanılabilir.
                      </p>
                      {gameData.players[playerId].chaosUsed && (
                        <p className="text-yellow-300 text-sm mt-2">⚠️ Bu oyunda kaos gücünüzü zaten kullandınız!</p>
                      )}
                    </div>

                    {!gameData.players[playerId].chaosUsed ? (
                      <>
                        <p className="mb-4 text-gray-300 text-center">Hangi oyuncunun rolünü değiştirmek istiyorsunuz?</p>
                        
                        <div className="space-y-3 mb-6">
                          {alivePlayers.filter(p => p.id !== playerId && isRoleInGame(p.role)).map(player => (
                            <button
                              key={player.id}
                              onClick={() => useChaosPower(player.id)}
                              className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl transition-all duration-300 transform hover:scale-105 border border-purple-500/30"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">🃏 {player.name}</span>
                                <span className="text-purple-300">Rolünü Değiştir</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-300">
                            💡 İpucu: Güçlü rolleri hedefleyerek oyun dengesini değiştirebilirsiniz!
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-300 mb-4">Bu oyunda kaos gücünüzü zaten kullandınız.</p>
                        <p className="text-sm text-gray-400">Diğer oyuncuların fazlarını tamamlamasını bekliyorsunuz...</p>
                        <div className="animate-pulse text-6xl mt-4">🃏</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Kaos Ustası gücünü kullanıyor...</p>
                    <p className="text-sm text-gray-400">Dikkatli olun, birinin rolü değişebilir!</p>
                    <div className="animate-spin text-6xl mt-4">🃏</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Son Tahmin Fazı */}
          {gamePhase === GAME_PHASES.FINAL_GUESS && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🎯 SON TAHMİN</h2>
                
                <div className="bg-yellow-900/30 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-yellow-300 mb-2">⚠️ KRİTİK AN!</h3>
                  <p className="text-sm text-gray-300">
                    Sadece 3 oyuncu kaldı ve 1 kötü takım üyesi var! Dedektif son tahmin hakkını kullanabilir.
                    Doğru tahmin ederse İyi Takım kazanır, yanlış tahmin ederse Kötü Takım kazanır.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">Kalan Oyuncular:</h3>
                  <div className="space-y-2">
                    {alivePlayers.map(player => (
                      <div key={player.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                        <span className="font-bold">{player.name}</span>
                        {player.id === playerId && <span className="text-green-400">(Siz)</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tüm ipuçları göster - sadece dedektife */}
                {myRole === 'DETECTIVE' && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3">🔍 Tüm İpuçlarınız:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {clues.map((clue, index) => (
                      <div key={index} className={`clue-appear ${
                        clue.clueType === 'fake' ? 'clue-fake' : 
                        clue.clueType === 'location' ? 'clue-location' : 'clue-visual'
                      }`} style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex justify-between items-start mb-2">
                          <strong className="text-white">🔍 Tur {clue.turn}</strong>
                          <span className="text-xs px-2 py-1 rounded-full bg-black/20">
                            {clue.clueType === 'fake' ? '⚠️ Şüpheli' : 
                             clue.clueType === 'location' ? '📍 Konum' : '👁️ Görsel'}
                          </span>
                        </div>
                        <p className="font-medium">{clue.clue}</p>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {myRole === 'DETECTIVE' ? (
                  <div>
                    <h3 className="font-bold text-blue-300 mb-3">🔎 Son Tahminizi Yapın:</h3>
                    <div className="space-y-2">
                      {alivePlayers.filter(p => p.id !== playerId).map(player => (
                        <button
                          key={player.id}
                          onClick={() => makeFinalGuess(player.id)}
                          className="block w-full p-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          🎯 {player.name} katildir!
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <p>Dedektif son tahminini yapıyor...</p>
                    <div className="animate-pulse text-4xl mt-4">🤔</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Oyun Sonu */}
          {gamePhase === GAME_PHASES.GAME_OVER && (
            <div className="max-w-4xl mx-auto">
              <div className="victory-screen text-center">
                <div className="text-6xl mb-6 animate-bounce-custom">
                  {gameData.winner === 'İyi Takım' ? '🎉' : '💀'}
                </div>
                <h2 className="text-4xl font-bold mb-6 text-glow">
                  {gameData.winner === 'İyi Takım' ? '🎉 İYİ TAKIM KAZANDI!' : '💀 KÖTÜ TAKIM KAZANDI!'}
                </h2>
                <div className="bg-slate-800/50 p-6 rounded-xl mb-8 border border-slate-600/50">
                  <p className="text-2xl mb-2 font-bold text-yellow-300">🏆 Kazanan: {gameData.winner}</p>
                  <p className="text-lg text-gray-300">📋 Sebep: {gameData.winReason}</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-6 text-glow">📊 Son Durum</h3>
                  <div className="players-grid">
                    {players.map((player, index) => (
                      <div key={player.id} className={`player-card ${player.isAlive ? 'alive' : 'dead'} animate-fadeIn`} style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg">{player.name}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            player.isAlive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {player.isAlive ? '✅ Yaşıyor' : '💀 Öldü'}
                        </span>
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-purple-300">{ROLES[player.role]?.name}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          <div>📍 {gameData.players[player.id]?.location}</div>
                          <div>👁️ {gameData.players[player.id]?.visualSymbol}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="btn-primary text-xl animate-glow"
                >
                  🔄 Ana Menüye Dön
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Gece Olayı Bildirimi - Herkese */}
      {showNightEventNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-purple-900 p-6 rounded-xl border-2 border-purple-500 max-w-md mx-4 text-center animate-scaleIn">
            <div className="text-4xl mb-4">🌙</div>
            <div className="text-white font-bold text-lg mb-2">Gece Olayı!</div>
            <div className="text-purple-200 whitespace-pre-line">{nightEventMessage}</div>
            <button
              onClick={() => setShowNightEventNotification(false)}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
