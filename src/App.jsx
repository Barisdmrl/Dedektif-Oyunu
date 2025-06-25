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
  SUSPECT: {
    name: '👥 Şüpheli',
    description: 'Rollerini bilmezler. Dedektife yardım etmeye çalışır.',
    team: 'good'
  },
  FORENSIC: {
    name: '🔬 Adli Tıpçı',
    description: 'Gece ölen bir oyuncunun rolünü öğrenebilir. Bilgiyi gizli tutar ve sözlü yönlendirme yapar.',
    team: 'good'
  },
  PSYCHOLOGIST: {
    name: '🧠 Psikolog',
    description: 'Geceleri bir kişiyi sorgular, %50 ihtimalle katil olup olmadığını öğrenir. Sonuç yanıltıcı olabilir.',
    team: 'good'
  },
  VAMPIRE: {
    name: '🧛 Kan Emici',
    description: 'Katilin kim olduğunu bilir ama öldürme yetkisi yoktur. Katil ölse bile bir gece daha hayatta kalabilir.',
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
    description: 'Her tur rol değiştirir. Rolünü kendisi bile bilmez, sistem geceleri bildirir.',
    team: 'neutral'
  }
}

// Oyun fazları
const GAME_PHASES = {
  LOBBY: 'lobby',
  ROLE_REVEAL: 'role_reveal',
  SECURITY: 'security',
  FORENSIC: 'forensic',
  PSYCHOLOGIST: 'psychologist',
  NIGHT: 'night',
  DAY: 'day',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  GAME_OVER: 'game_over',
  FINAL_GUESS: 'final_guess'
}

// Rastgele roller havuzu
const RANDOM_ROLES_POOL = [
  'FORENSIC', 'PSYCHOLOGIST', 'VAMPIRE', 'TWINS', 'REFLECTOR', 'MYSTERIOUS'
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
    id: 'full_moon',
    name: '🌕 Dolunay',
    description: 'Dolunay etkisi, kan emici güçleniyor.',
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

    // Firebase bağlantısı test et
  useEffect(() => {
    const testConnection = async () => {
      try {
        const testRef = ref(database, '.info/connected')
        onValue(testRef, (snapshot) => {
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
  }, [])

  // Oylama süre takibi
  useEffect(() => {
    if (gameData && gameData.votingStartTime && gamePhase === GAME_PHASES.VOTING) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameData.votingStartTime) / 1000)
        const timeLeft = Math.max(0, 60 - elapsed)
        
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
    if (gameRoomId) {
      const gameRef = ref(database, `games/${gameRoomId}`)
      
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setGameData(data)
          setPlayers(Object.values(data.players || {}))
          setGamePhase(data.gamePhase || GAME_PHASES.LOBBY)
          setCurrentPlayerIndex(data.currentPlayerIndex || 0)
          setConnectionStatus('connected')
          
          // Kendi rolümü bul
          if (data.players && playerId && data.players[playerId]) {
            setMyRole(data.players[playerId].role)
          }
        } else {
          setConnectionStatus('game_not_found')
        }
      })

      return () => off(gameRef, 'value', unsubscribe)
    }
  }, [gameRoomId, playerId])

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
    if (!playerName.trim()) {
      alert('Lütfen isminizi girin!')
      return
    }

    try {
      // Özel oda kodu oluştur
      const roomId = generateRoomCode()
      
      // Oda kodunun benzersiz olduğundan emin ol
      const gameRef = ref(database, `games/${roomId}`)
      const snapshot = await get(gameRef)
      
      if (snapshot.exists()) {
        // Eğer oda kodu zaten varsa, yeni bir tane oluştur
        return createGameRoom()
      }
      
      const newPlayerId = `player_${Date.now()}`
      
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

      await set(gameRef, gameData)
      
      setGameRoomId(roomId)
      setPlayerId(newPlayerId)
      setIsHost(true)
      setConnectionStatus('connected')
      
      // Başarı mesajı göster
      console.log(`🎮 Oyun odası oluşturuldu! Oda kodu: ${roomId}`)
    } catch (error) {
      console.error('Oyun odası oluşturulurken hata:', error)
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
    if (!isHost || !gameRoomId) return

    const playerList = Object.values(gameData.players)
    const playerCount = playerList.length
    
    if (playerCount < 4) {
      alert('En az 4 oyuncu gerekli!')
      return
    }
    
    if (playerCount > 12) {
      alert('En fazla 12 oyuncu olabilir!')
      return
    }

    // Temel roller (her oyunda olacak)
    let killerCount, spyCount = 1, detectiveCount = 1, securityCount = 0, innocentCount, suspectCount
    
    // Oyuncu sayısına göre temel rol dağılımı
    if (playerCount === 4) {
      killerCount = 1
      innocentCount = 1
      suspectCount = 1
    } else if (playerCount >= 5 && playerCount <= 6) {
      killerCount = 1
      securityCount = 1
      innocentCount = 0
      suspectCount = playerCount - 4
    } else if (playerCount >= 7 && playerCount <= 8) {
      killerCount = 1
      securityCount = 1
      innocentCount = 0
      suspectCount = playerCount - 4
    } else if (playerCount >= 9 && playerCount <= 10) {
      killerCount = 2
      securityCount = 1
      innocentCount = 0
      suspectCount = playerCount - 5
    } else if (playerCount >= 11 && playerCount <= 12) {
      killerCount = 2
      securityCount = 1
      innocentCount = 0
      suspectCount = playerCount - 5
    } else { // 13+
      killerCount = 3
      securityCount = 1
      innocentCount = 0
      suspectCount = playerCount - 5
    }

    // Rastgele roller havuzu - her oyunda 2-3 ekstra rol
    const extraRoleCount = Math.min(3, Math.max(2, Math.floor(playerCount / 4)))
    const shuffledRandomRoles = [...RANDOM_ROLES_POOL].sort(() => Math.random() - 0.5)
    const selectedRandomRoles = shuffledRandomRoles.slice(0, extraRoleCount)
    
    // Seçilen rolleri say
    let forensicCount = 0, psychologistCount = 0, vampireCount = 0, 
        twinsCount = 0, reflectorCount = 0, mysteriousCount = 0
    
    selectedRandomRoles.forEach(role => {
      switch(role) {
        case 'FORENSIC': forensicCount = 1; break
        case 'PSYCHOLOGIST': psychologistCount = 1; break
        case 'VAMPIRE': vampireCount = 1; break
        case 'TWINS': twinsCount = 2; break // İkizler çift gelir
        case 'REFLECTOR': reflectorCount = 1; break
        case 'MYSTERIOUS': mysteriousCount = 1; break
      }
    })
    
    // Ekstra rollerin yerini şüphelilerden al
    const totalExtraRoles = forensicCount + psychologistCount + vampireCount + twinsCount + reflectorCount + mysteriousCount
    suspectCount = Math.max(0, suspectCount - totalExtraRoles)

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
    for (let i = 0; i < innocentCount; i++) roles.push('INNOCENT')
    for (let i = 0; i < suspectCount; i++) roles.push('SUSPECT')

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
      playersWithRoles[player.id] = {
        ...player,
        role: role,
        isAlive: true,
        // Konum ve sembol sistemi
        location: shuffledLocations[index % shuffledLocations.length],
        visualSymbol: shuffledSymbols[index % shuffledSymbols.length],
        // Yeni roller için özel özellikler
        reflectorUsed: role === 'REFLECTOR' ? false : undefined,
        doubleVoteUsed: false, // İkizler için
        vampireExtraLife: role === 'VAMPIRE' ? false : undefined,
        mysteriousCurrentRole: role === 'MYSTERIOUS' ? 'INNOCENT' : undefined // Başlangıçta masum
      }
      
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
      currentNightEvent: null
    })
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
      const gameRef = ref(database, `games/${gameRoomId}`)
      const hasSecurity = Object.values(gameData.players).some(p => p.role === 'SECURITY' && p.isAlive)
      const hasForensic = Object.values(gameData.players).some(p => p.role === 'FORENSIC' && p.isAlive)
      const hasPsychologist = Object.values(gameData.players).some(p => p.role === 'PSYCHOLOGIST' && p.isAlive)
      
      if (hasSecurity) {
        await update(gameRef, { gamePhase: GAME_PHASES.SECURITY })
      } else if (hasForensic && gameData.turn > 1) { // İlk turda ölen yok
        await update(gameRef, { gamePhase: GAME_PHASES.FORENSIC })
      } else if (hasPsychologist) {
        await update(gameRef, { gamePhase: GAME_PHASES.PSYCHOLOGIST })
      } else {
        await update(gameRef, { gamePhase: GAME_PHASES.NIGHT })
      }
    }
  }

  // Oyuncu koru (sadece güvenlik)
  const protectPlayer = async (targetId) => {
    if (myRole !== 'SECURITY' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    const hasForensic = Object.values(gameData.players).some(p => p.role === 'FORENSIC' && p.isAlive)
    const hasPsychologist = Object.values(gameData.players).some(p => p.role === 'PSYCHOLOGIST' && p.isAlive)
    
    let nextPhase = GAME_PHASES.NIGHT
    if (hasForensic && gameData.turn > 1) {
      nextPhase = GAME_PHASES.FORENSIC
    } else if (hasPsychologist) {
      nextPhase = GAME_PHASES.PSYCHOLOGIST
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
    
    // Adli tıpçının özel bilgilerini kaydet
    const forensicInfoRef = ref(database, `games/${gameRoomId}/forensicInfo/${playerId}`)
    await push(forensicInfoRef, {
      turn: gameData.turn,
      deadPlayer: deadPlayer.name,
      role: deadPlayer.role,
      investigatedAt: Date.now()
    })

    await update(gameRef, {
      gamePhase: hasPsychologist ? GAME_PHASES.PSYCHOLOGIST : GAME_PHASES.NIGHT
    })
  }

  // Psikolog - Oyuncu sorgula
  const interrogatePlayer = async (targetId) => {
    if (myRole !== 'PSYCHOLOGIST' || !gameRoomId) return
    
    // Gece olayı kontrolü
    if (isRoleDisabledByEvent('PSYCHOLOGIST')) {
      alert('⛈️ Fırtınalı gece nedeniyle konsantre olamıyorsunuz!')
      return
    }

    const targetPlayer = gameData.players[targetId]
    if (!targetPlayer) return

    // %50 ihtimalle doğru sonuç
    const isAccurate = Math.random() < 0.5
    const actualIsKiller = targetPlayer.role === 'KILLER' || targetPlayer.role === 'VAMPIRE'
    const result = isAccurate ? actualIsKiller : !actualIsKiller

    const gameRef = ref(database, `games/${gameRoomId}`)
    
    // Psikolog bilgilerini kaydet
    const psychologistInfoRef = ref(database, `games/${gameRoomId}/psychologistInfo/${playerId}`)
    await push(psychologistInfoRef, {
      turn: gameData.turn,
      target: targetPlayer.name,
      result: result ? 'Şüpheli' : 'Temiz',
      isAccurate: isAccurate,
      investigatedAt: Date.now()
    })

    await update(gameRef, {
      gamePhase: GAME_PHASES.NIGHT
    })
  }

  // Gece olayı belirle
  const determineNightEvent = () => {
    // %30 ihtimalle bir olay olur
    if (Math.random() > 0.3) return null
    
    // Olasılıklara göre olay seç
    const random = Math.random()
    let cumulativeProbability = 0
    
    for (const event of NIGHT_EVENTS) {
      cumulativeProbability += event.probability
      if (random <= cumulativeProbability) {
        return event
      }
    }
    
    return null
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
          } else if (targetPlayer.role === 'REFLECTOR' && !targetPlayer.reflectorUsed) {
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
          if (nightEvent) {
            await applyNightEventEffects(nightEvent)
          }
          
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
      if (nightEvent) {
        await applyNightEventEffects(nightEvent)
      }
      
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

    const voteRef = ref(database, `games/${gameRoomId}/votes/${playerId}`)
    await set(voteRef, targetId)
    setHasVoted(true)
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
    const voteCounts = {}
    
    // Sadece yaşayan oyuncuların oylarını say (SKIP oylarını hariç tut)
    Object.entries(votes).forEach(([voterId, targetId]) => {
      const voter = gameData.players[voterId]
      if (voter && voter.isAlive && targetId !== 'SKIP') {
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
        ['DETECTIVE', 'SPY', 'SECURITY', 'INNOCENT', 'SUSPECT', 'FORENSIC', 'PSYCHOLOGIST', 'TWINS', 'REFLECTOR'].includes(p.role)
      )
      
      if (totalEvil === 0) {
        // Tüm kötü takım elendi - İyi takım kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'İyi Takım (Dedektif + Masum + Şüpheliler + Casus + Güvenlik + Adli Tıpçı + Psikolog + İkizler + Yansıtıcı)'
        updates.winReason = 'Tüm katiller ve kan emiciler elenmiştir'
      } else if (aliveGoodTeam.length === 0) {
        // Tüm iyi takım öldü - Kötü takım kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'Kötü Takım (Katiller + Kan Emici)'
        updates.winReason = 'Tüm iyi takım üyeleri elendi'
      } else if (totalEvil >= aliveGoodTeam.length) {
        // Kötü takım sayısı >= İyi takım sayısı - Kötü takım kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'Kötü Takım (Katiller + Kan Emici)'
        updates.winReason = 'Kötü takım sayı üstünlüğü ele geçirdi'
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
    const hasDeceptiveRoles = alivePlayers.some(p => ['VAMPIRE', 'MYSTERIOUS'].includes(p.role))
    
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
      updates.winner = 'İyi Takım (Dedektif + Şüpheliler + Casus + Diğer İyi Roller)'
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

        {/* Kurallar Modalı */}
        {showRules && (
          <div className="modal-overlay" onClick={() => setShowRules(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                  📖 OYUN KURALLARI
                </h2>
                <p className="text-gray-400">Ters Dedektif: Katili Bul - Tam Rehber</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 rounded-xl">
                    <h3 className="font-bold text-xl mb-3 text-purple-300">🎯 Oyunun Amacı</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Bu bir sosyal çıkarım oyunudur. İyi takım (Dedektif, Casus, Şüpheliler) katili bulmaya çalışırken, 
                      katil yakalanmamaya ve herkesi elemeye çalışır.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/50 to-teal-900/50 p-6 rounded-xl">
                    <h3 className="font-bold text-xl mb-3 text-green-300">🎮 Oynanış Sırası</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="bg-gray-700 text-white text-sm px-2 py-1 rounded font-bold">1</span>
                        <div>
                          <strong className="text-yellow-300">Lobby:</strong>
                          <p className="text-sm text-gray-300">Oyuncular oda kodunu paylaşarak katılır (min 4 kişi)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="bg-gray-700 text-white text-sm px-2 py-1 rounded font-bold">2</span>
                        <div>
                          <strong className="text-yellow-300">Rol Dağıtımı:</strong>
                          <p className="text-sm text-gray-300">Her oyuncu gizlice kendi rolünü öğrenir</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="bg-gray-700 text-white text-sm px-2 py-1 rounded font-bold">3</span>
                        <div>
                          <strong className="text-yellow-300">Gece:</strong>
                          <p className="text-sm text-gray-300">Katil kurbanını seçer</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="bg-gray-700 text-white text-sm px-2 py-1 rounded font-bold">4</span>
                        <div>
                          <strong className="text-yellow-300">Gündüz:</strong>
                          <p className="text-sm text-gray-300">Herkes tartışır, dedektif ipucu alabilir</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="bg-gray-700 text-white text-sm px-2 py-1 rounded font-bold">5</span>
                        <div>
                          <strong className="text-yellow-300">Oylama:</strong>
                          <p className="text-sm text-gray-300">En çok oy alan oyuncu elenir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                                      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6 rounded-xl">
                      <h3 className="font-bold text-xl mb-3 text-red-300">🏆 Kazanma Koşulları</h3>
                      <div className="space-y-3">
                        <div className="bg-green-800/30 p-3 rounded-lg">
                          <strong className="text-green-300">İyi Takım Kazanır:</strong>
                          <p className="text-sm text-gray-300 mt-1">Tüm katilleri ve kan emicileri oylama ile elerlerse</p>
                        </div>
                        <div className="bg-red-800/30 p-3 rounded-lg">
                          <strong className="text-red-300">Kötü Takım Kazanır:</strong>
                          <p className="text-sm text-gray-300 mt-1">Tüm iyi takımı öldürürse veya sayı üstünlüğü ele geçirirse</p>
                        </div>
                        <div className="bg-blue-800/30 p-3 rounded-lg">
                          <strong className="text-blue-300">Son Tahmin:</strong>
                          <p className="text-sm text-gray-300 mt-1">3 kişi kalırsa ve dedektif hayattaysa, son tahmin hakkı</p>
                        </div>
                      </div>
                    </div>

                  <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 p-6 rounded-xl">
                    <h3 className="font-bold text-xl mb-3 text-yellow-300">⚠️ Önemli Kurallar</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Roller gizli tutulmalıdır</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Casus katili bilir ama belli etmemelidir</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Dedektif ipuçlarını dikkatlice değerlendirmelidir</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Şüpheliler dedektife yardım etmeye çalışmalıdır</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Oyun dışı iletişim kurulmaz</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-xl">
                    <h3 className="font-bold text-xl mb-3 text-indigo-300">💡 Strateji İpuçları</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-purple-300">Dedektif:</strong> İpuçlarını birleştir, şüphelileri gözlemle</p>
                      <p><strong className="text-blue-300">Casus:</strong> Gizlice yardım et, belli etme</p>
                      <p><strong className="text-red-300">Katil:</strong> Tüm iyi takımı hedefle, strateji yap</p>
                      <p><strong className="text-green-300">Şüpheli:</strong> Dedektife güven, mantıklı oy ver</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 p-6 rounded-xl">
                    <h3 className="font-bold text-xl mb-3 text-orange-300">🎲 Dinamik Özellikler</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-yellow-300">Rastgele Roller:</strong> Her oyunda 2-3 ekstra rol aktif olur</p>
                      <p><strong className="text-purple-300">Gece Olayları:</strong> %30 ihtimalle gece özel olaylar yaşanır</p>
                      <p><strong className="text-blue-300">Konum Sistemi:</strong> Her oyuncunun bir konumu var (ipuçlarda kullanılır)</p>
                      <p><strong className="text-green-300">Görsel Semboller:</strong> Her oyuncunun görsel özelliği var</p>
                      <p><strong className="text-red-300">Sahte İpuçları:</strong> %30 ihtimalle yanıltıcı ipuçları</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-900/50 to-teal-900/50 p-6 rounded-xl">
                    <h3 className="font-bold text-xl mb-3 text-cyan-300">🔍 İpucu Sistemi</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-blue-300">📍 Konum İpuçları:</strong> Oyuncuların bulunduğu yerlerle ilgili</p>
                      <p><strong className="text-purple-300">👁️ Görsel İpuçları:</strong> Oyuncuların görsel özellikleriyle ilgili</p>
                      <p><strong className="text-red-300">⚠️ Şüpheli İpuçları:</strong> Yanıltıcı veya sahte olabilir</p>
                      <p><strong className="text-yellow-300">💡 Strateji:</strong> İpuçlarını oyuncu bilgileriyle karşılaştırın</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowRules(false)}
                  className="btn-primary text-lg px-8 py-4"
                >
                  ✅ Anladım!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roller Modalı */}
        {showRoles && (
          <div className="modal-overlay" onClick={() => setShowRoles(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎭 TÜM ROLLER
                </h2>
                <p className="text-gray-400">Ters Dedektif: Katili Bul - Rol Rehberi</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Temel Roller */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-green-300 text-center mb-4">✅ Temel Roller</h3>
                  {Object.entries(ROLES).slice(0, 6).map(([key, role], index) => (
                    <div key={key} className={`p-4 rounded-xl border-l-4 transition-all hover:scale-105 animate-fadeIn ${
                      role.team === 'good' ? 'bg-green-900/30 border-green-500' :
                      role.team === 'evil' ? 'bg-red-900/30 border-red-500' :
                      'bg-gray-900/30 border-gray-500'
                    }`} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-white">{role.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          role.team === 'good' ? 'bg-green-600 text-white' :
                          role.team === 'evil' ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {role.team === 'good' ? '👼 İyi' : role.team === 'evil' ? '😈 Kötü' : '⚖️ Nötr'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{role.description}</p>
                    </div>
                  ))}
                </div>

                {/* Rastgele Roller */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-purple-300 text-center mb-4">🎲 Rastgele Roller</h3>
                  {Object.entries(ROLES).slice(6).map(([key, role], index) => (
                    <div key={key} className={`p-4 rounded-xl border-l-4 transition-all hover:scale-105 animate-fadeIn ${
                      role.team === 'good' ? 'bg-green-900/30 border-green-500' :
                      role.team === 'evil' ? 'bg-red-900/30 border-red-500' :
                      'bg-purple-900/30 border-purple-500'
                    }`} style={{animationDelay: `${(index + 6) * 0.1}s`}}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-white">{role.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          role.team === 'good' ? 'bg-green-600 text-white' :
                          role.team === 'evil' ? 'bg-red-600 text-white' :
                          'bg-purple-600 text-white'
                        }`}>
                          {role.team === 'good' ? '👼 İyi' : role.team === 'evil' ? '😈 Kötü' : '🔮 Nötr'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{role.description}</p>
                    </div>
                  ))}
                  
                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 rounded-xl border border-purple-500/30">
                    <h4 className="font-bold text-purple-300 mb-2">🎯 Rastgele Rol Sistemi</h4>
                    <p className="text-sm text-gray-300">
                      Her oyunda bu 6 rolden 2-3 tanesi rastgele seçilir ve oyuncular arasında dağıtılır. 
                      Hangi rollerin aktif olduğu lobby'de gösterilir ama kimde olduğu bilinmez!
                    </p>
                  </div>
                </div>
              </div>

              {/* Takım Bilgileri */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-4 rounded-xl text-center border border-green-500/30">
                  <h4 className="font-bold text-green-300 mb-2">👼 İyi Takım</h4>
                  <p className="text-sm text-gray-300">Katili bulmaya çalışır</p>
                  <div className="text-xs text-green-400 mt-2">
                    Dedektif, Casus, Güvenlik, Masum, Şüpheli, Adli Tıpçı, Psikolog, İkizler, Yansıtıcı
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-900/50 to-rose-900/50 p-4 rounded-xl text-center border border-red-500/30">
                  <h4 className="font-bold text-red-300 mb-2">😈 Kötü Takım</h4>
                  <p className="text-sm text-gray-300">Yakalanmamaya çalışır</p>
                  <div className="text-xs text-red-400 mt-2">
                    Katil, Kan Emici
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-xl text-center border border-purple-500/30">
                  <h4 className="font-bold text-purple-300 mb-2">🔮 Özel Takım</h4>
                  <p className="text-sm text-gray-300">Kendine özel kuralları var</p>
                  <div className="text-xs text-purple-400 mt-2">
                    Gizemli Adam
                  </div>
                </div>
              </div>

              {/* Strateji İpuçları */}
              <div className="mt-8 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-6 rounded-xl border border-yellow-500/30">
                <h3 className="font-bold text-xl mb-4 text-yellow-300 text-center">💡 Rol Stratejileri</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p><strong className="text-blue-300">🔎 Dedektif:</strong> İpuçlarını analiz et, şüphelilere güven</p>
                    <p><strong className="text-green-300">🕵️ Casus:</strong> Katili bil ama belli etme, gizlice yardım et</p>
                    <p><strong className="text-cyan-300">🛡️ Güvenlik:</strong> Strateji ile koruma yap, dedektifi koru</p>
                    <p><strong className="text-purple-300">🔬 Adli Tıpçı:</strong> Ölü rolleri öğren, bilgiyi akıllıca kullan</p>
                    <p><strong className="text-pink-300">🧠 Psikolog:</strong> Sorgu sonuçlarını dikkatli değerlendir</p>
                    <p><strong className="text-blue-300">👥 İkizler:</strong> İkizinle koordineli çalış, çift oy gücünü sakla</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong className="text-red-300">🔪 Katil:</strong> Strateji yap, dedektifi bul ve eleme</p>
                    <p><strong className="text-red-300">🧛 Kan Emici:</strong> Katili bil, kaos yarat, hayatta kal</p>
                    <p><strong className="text-orange-300">🪞 Yansıtıcı:</strong> Yansıtma gücünü doğru zamanda kullan</p>
                    <p><strong className="text-indigo-300">🧙 Gizemli:</strong> Her tur yeni role adapte ol</p>
                    <p><strong className="text-gray-300">😇 Masum/Şüpheli:</strong> Dedektife yardım et, mantıklı oy ver</p>
                    <p><strong className="text-yellow-300">💡 Genel:</strong> Rolleri gizli tut, blöf yap, gözlemle</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowRoles(false)}
                  className="btn-primary text-lg px-8 py-4"
                >
                  ✅ Anladım!
                </button>
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
                      onClick={startGame}
                      disabled={players.length < 4}
                      className={`w-full text-xl ${players.length < 4 ? 'btn-ghost cursor-not-allowed opacity-50' : 'btn-success animate-pulse-custom'}`}
                    >
                      {players.length < 4 ? `Oyunu Başlat (${players.length}/4)` : '🎮 Oyunu Başlat'}
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
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🧠 PSİKOLOG - Tur {gameData.turn}</h2>
                
                {myRole === 'PSYCHOLOGIST' ? (
                  <div>
                    <div className="bg-purple-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-purple-300">🧠 Psikolojik Analiz:</p>
                      <p className="text-sm text-gray-400">
                        Bir oyuncuyu sorgulayın. %50 ihtimalle doğru sonuç alırsınız - sonuç yanıltıcı olabilir!
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {alivePlayers.filter(p => p.role !== 'PSYCHOLOGIST').map(player => (
                        <button
                          key={player.id}
                          onClick={() => interrogatePlayer(player.id)}
                          className="block w-full p-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                        >
                          🧠 {player.name}'i sorgula
                        </button>
                      ))}
                    </div>
                    
                    {/* Psikolog'un önceki analizleri */}
                    {gameData.psychologistInfo && gameData.psychologistInfo[playerId] && (
                      <div className="mt-4 bg-orange-900 p-3 rounded">
                        <p className="text-sm text-orange-300 mb-2">🧠 Önceki Analizleriniz:</p>
                        {Object.values(gameData.psychologistInfo[playerId]).map((info, index) => (
                          <div key={index} className="text-sm">
                            <strong>Tur {info.turn}:</strong> {info.target} - {info.result}
                            <span className="text-xs text-gray-400 ml-2">
                              ({info.isAccurate ? 'Doğru' : 'Yanıltıcı'})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">Psikolog analiz yapıyor...</p>
                    <p className="text-sm text-gray-400">
                      Psikolog bir oyuncuyu sorguluyor...
                    </p>
                    <div className="animate-pulse text-6xl mt-4">🧠</div>
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
                      {alivePlayers.filter(p => p.role !== 'SECURITY').map(player => (
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
                        {alivePlayers.filter(p => p.role !== 'KILLER').map(player => (
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
                      🔎 Dedektif: İpuçlarınızı kullanarak şüphelileri yönlendirin, ama kendinizi açık etmeyin!
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
                  {myRole === 'SUSPECT' && (
                    <p className="text-sm text-yellow-300">
                      👥 Şüpheli: Dedektife yardım etmeye çalışın. İpuçlarını analiz edin.
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
    </div>
  )
}

export default App
