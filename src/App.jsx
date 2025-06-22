import { useState, useEffect } from 'react'
import { database } from './firebase'
import { ref, push, set, onValue, off, remove, update } from 'firebase/database'
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
  }
}

// Oyun fazları
const GAME_PHASES = {
  LOBBY: 'lobby',
  ROLE_REVEAL: 'role_reveal',
  SECURITY: 'security',
  NIGHT: 'night',
  DAY: 'day',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  GAME_OVER: 'game_over',
  FINAL_GUESS: 'final_guess'
}

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
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [firebaseConnected, setFirebaseConnected] = useState(false)
  const [protectedPlayer, setProtectedPlayer] = useState(null)

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
  const createGameRoom = async () => {
    if (!playerName.trim()) {
      alert('Lütfen isminizi girin!')
      return
    }

    try {
      const gamesRef = ref(database, 'games')
      const newGameRef = push(gamesRef)
      const roomId = newGameRef.key
      
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

      await set(newGameRef, gameData)
      
      setGameRoomId(roomId)
      setPlayerId(newPlayerId)
      setIsHost(true)
      setConnectionStatus('connected')
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
      const gameRef = ref(database, `games/${roomId}`)
      const newPlayerId = `player_${Date.now()}`
      
      // Oyuncu ekle
      const playerRef = ref(database, `games/${roomId}/players/${newPlayerId}`)
      await set(playerRef, {
        id: newPlayerId,
        name: playerName,
        isHost: false,
        joinedAt: Date.now(),
        isAlive: true
      })

      setGameRoomId(roomId)
      setPlayerId(newPlayerId)
      setIsHost(false)
      setConnectionStatus('connected')
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

    // Oyuncu sayısına göre rol dağılımı
    let killerCount, spyCount = 1, detectiveCount = 1, securityCount = 1, innocentCount, suspectCount
    
    if (playerCount === 4) {
      killerCount = 1
      securityCount = 0
      innocentCount = 1
      suspectCount = 1
    } else if (playerCount >= 5 && playerCount <= 6) {
      killerCount = 1
      innocentCount = 1
      suspectCount = playerCount - 5 // 0-1 şüpheli
    } else if (playerCount >= 7 && playerCount <= 8) {
      killerCount = 2
      innocentCount = 1
      suspectCount = playerCount - 6 // 1-2 şüpheli
    } else if (playerCount >= 9 && playerCount <= 10) {
      killerCount = 2
      innocentCount = 2
      suspectCount = playerCount - 7 // 2-3 şüpheli
    } else { // 11-12
      killerCount = 3
      innocentCount = 2
      suspectCount = playerCount - 8 // 3-4 şüpheli
    }

    // Rolleri oluştur
    const roles = []
    for (let i = 0; i < killerCount; i++) roles.push('KILLER')
    for (let i = 0; i < spyCount; i++) roles.push('SPY')
    for (let i = 0; i < detectiveCount; i++) roles.push('DETECTIVE')
    if (securityCount > 0) {
      for (let i = 0; i < securityCount; i++) roles.push('SECURITY')
    }
    for (let i = 0; i < innocentCount; i++) roles.push('INNOCENT')
    for (let i = 0; i < suspectCount; i++) roles.push('SUSPECT')

    // Oyuncuları karıştır ve rolleri ata
    const shuffledPlayers = [...playerList].sort(() => Math.random() - 0.5)
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5)

    const playersWithRoles = {}
    shuffledPlayers.forEach((player, index) => {
      playersWithRoles[player.id] = {
        ...player,
        role: shuffledRoles[index],
        isAlive: true
      }
    })

    // Oyun durumunu güncelle
    const gameRef = ref(database, `games/${gameRoomId}`)
    await update(gameRef, {
      gamePhase: GAME_PHASES.ROLE_REVEAL,
      players: playersWithRoles,
      currentPlayerIndex: 0,
      turn: 1,
      startedAt: Date.now(),
      killerCount,
      maxPlayers: playerCount
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
      // Güvenlik fazına geç (eğer güvenlik varsa)
      const hasSecurity = Object.values(gameData.players).some(p => p.role === 'SECURITY' && p.isAlive)
      const gameRef = ref(database, `games/${gameRoomId}`)
      
      if (hasSecurity) {
        await update(gameRef, {
          gamePhase: GAME_PHASES.SECURITY
        })
      } else {
        await update(gameRef, {
          gamePhase: GAME_PHASES.NIGHT
        })
      }
    }
  }

  // Oyuncu koru (sadece güvenlik)
  const protectPlayer = async (targetId) => {
    if (myRole !== 'SECURITY' || !gameRoomId) return

    const gameRef = ref(database, `games/${gameRoomId}`)
    await update(gameRef, {
      protectedPlayer: targetId,
      gamePhase: GAME_PHASES.NIGHT
    })
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
        
        // Koruma kontrolü
        const updates = {}
        if (gameData.protectedPlayer === finalTarget) {
          // Oyuncu korundu, öldürülemez
          updates.gamePhase = GAME_PHASES.DAY
          updates.killerVotes = null
          updates.protectedPlayer = null
          updates.lastNightResult = 'protected'
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
        
        await update(gameRef, updates)
      }
    } else {
      // Tek katil sistemi - koruma kontrolü ile
      const updates = {}
      if (gameData.protectedPlayer === targetId) {
        // Oyuncu korundu, öldürülemez
        updates.gamePhase = GAME_PHASES.DAY
        updates.protectedPlayer = null
        updates.lastNightResult = 'protected'
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
      
      await update(gameRef, updates)
    }
  }

  // Oy ver
  const votePlayer = async (targetId) => {
    if (!playerId || !gameRoomId) return

    const voteRef = ref(database, `games/${gameRoomId}/votes/${playerId}`)
    await set(voteRef, targetId)
  }

  // Oyları say ve eleme yap (sadece host)
  const processVotes = async () => {
    if (!isHost || !gameRoomId) return

    const votes = gameData.votes || {}
    const voteCounts = {}
    
    Object.values(votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
    })

    // En çok oy alan oyuncu
    const maxVotes = Math.max(...Object.values(voteCounts))
    const eliminatedId = Object.keys(voteCounts).find(id => voteCounts[id] === maxVotes)
    
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
      const aliveDetective = alivePlayers.find(p => p.role === 'DETECTIVE')
      const aliveSpy = alivePlayers.find(p => p.role === 'SPY')
      const aliveSecurity = alivePlayers.find(p => p.role === 'SECURITY')
      const totalAlive = alivePlayers.length
      
      if (aliveKillers.length === 0) {
        // Tüm katiller elendi - İyi takım kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'İyi Takım (Dedektif + Masum + Şüpheliler + Casus + Güvenlik)'
        updates.winReason = 'Tüm katiller elenmiştir'
      } else if (!aliveDetective) {
        // Dedektif öldü - Katiller kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'Kötü Takım (Katiller)'
        updates.winReason = 'Dedektif elendi'
      } else if (totalAlive <= aliveKillers.length) {
        // Katil sayısı >= Toplam oyuncu sayısı - Katiller kazandı
        updates.gamePhase = GAME_PHASES.GAME_OVER
        updates.winner = 'Kötü Takım (Katiller)'
        updates.winReason = 'Katiller çoğunluğu ele geçirdi'
      } else if (totalAlive === 3 && aliveDetective && aliveSpy) {
        // Son 3 kişi kaldı ve dedektif + casus hayatta - Son tahmin hakkı
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
    
    const clueTypes = [
      // Fiziksel ipuçları
      `${deadPlayer.name}'in yanında "${killer.name[0]}" harfi ile başlayan bir not bulundu.`,
      `${deadPlayer.name}'in cebinde ${killer.name.length} harfli bir isim yazılıydı.`,
      `Olay yerinde ${killer.name.toLowerCase().includes('a') ? 'kırmızı' : 'mavi'} renkli bir eşya bulundu.`,
      
      // Sosyal ipuçları  
      `${deadPlayer.name} son nefesinde "${killer.name.includes('e') ? 'E' : 'İ'}" sesini çıkardı.`,
      `Tanıklar ${deadPlayer.name}'in ${killer.name.toLowerCase().includes('r') ? 'sağ' : 'sol'} tarafından saldırıya uğradığını söylüyor.`,
      `${deadPlayer.name}'in telefonda son konuştuğu kişi ${killer.name.split('').reverse()[0]} harfi ile biten biriydi.`,
      
      // Davranışsal ipuçları
      `Güvenlik kamerası, katilın ${killer.name.length > 5 ? 'uzun' : 'kısa'} isimli biri olduğunu gösteriyor.`,
      `${deadPlayer.name} öldürülmeden önce "${killer.name.includes('l') ? 'Lütfen' : 'Hayır'}" diye bağırmış.`,
      `Olay yerindeki ayak izleri ${killer.name.toLowerCase().includes('m') ? 'büyük' : 'küçük'} ayak numarasına ait.`
    ]
    
    const randomClue = clueTypes[Math.floor(Math.random() * clueTypes.length)]
    
    const cluesRef = ref(database, `games/${gameRoomId}/clues`)
    await push(cluesRef, {
      turn: gameData.turn,
      clue: randomClue,
      from: deadPlayer.name,
      addedAt: Date.now(),
      detective: players.find(p => p.id === playerId)?.name
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
    
    setGameRoomId(null)
    setPlayerId(null)
    setIsHost(false)
    setGameData(null)
    setPlayers([])
    setMyRole(null)
    setConnectionStatus('disconnected')
  }

  // Son tahmin yap (sadece dedektif)
  const makeFinalGuess = async (suspectId) => {
    if (myRole !== 'DETECTIVE' || !gameRoomId) return

    const suspect = Object.values(gameData.players).find(p => p.id === suspectId)
    const gameRef = ref(database, `games/${gameRoomId}`)
    
    const updates = {}
    
    if (suspect.role === 'KILLER') {
      // Doğru tahmin - İyi takım kazandı
      updates.gamePhase = GAME_PHASES.GAME_OVER
      updates.winner = 'İyi Takım (Dedektif + Şüpheliler + Casus)'
      updates.winReason = `Dedektif ${suspect.name}'i doğru tahmin etti!`
      updates.finalGuessCorrect = true
    } else {
      // Yanlış tahmin - Katiller kazandı
      updates.gamePhase = GAME_PHASES.GAME_OVER
      updates.winner = 'Kötü Takım (Katiller)'
      updates.winReason = `Dedektif yanlış tahmin etti! ${suspect.name} katil değildi.`
      updates.finalGuessCorrect = false
    }
    
    updates.finalGuessTarget = suspectId
    updates.finalGuessBy = playerId
    
    await update(gameRef, updates)
  }

  // Oyun odası bağlantısı yok
  if (!gameRoomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col overflow-hidden">
        {/* Ana Header */}
        <header className="text-center py-12 bg-gradient-to-r from-purple-800/20 to-red-800/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              🔪 TERS DEDEKTİF
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">
              KATİLİ BUL
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              🔥 Hot Reload Aktif - Gerçek zamanlı multiplayer dedektif oyunu
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-purple-700/50 px-3 py-1 rounded-full">🎭 Gizli Roller</span>
              <span className="bg-red-700/50 px-3 py-1 rounded-full">🌙 Gece Öldürme</span>
              <span className="bg-yellow-700/50 px-3 py-1 rounded-full">☀️ Gündüz Oylama</span>
              <span className="bg-blue-700/50 px-3 py-1 rounded-full">🔍 İpucu Toplama</span>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              📖 Oyun Kuralları
            </button>
          </div>
        </header>

        {/* Ana İçerik */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
            
            {/* Sol Taraf - Roller */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-center text-purple-300">🎭 OYUN ROLLERİ</h2>
              <div className="space-y-4">
                {Object.values(ROLES).map((role, index) => (
                  <div key={index} className="bg-gray-700/50 p-4 rounded-xl border-l-4 border-purple-500 hover:bg-gray-600/50 transition-all">
                    <h3 className="text-xl font-bold mb-2 text-yellow-300">{role.name}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{role.description}</p>
                  </div>
                ))}
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
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-center text-green-300">🎮 OYUNA KATIL</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-gray-300">
                  👤 Oyuncu Adınız
                </label>
                <input
                  type="text"
                  placeholder="Dedektif adınızı girin..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-4 bg-gray-700 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none text-white placeholder-gray-400 text-lg"
                />
              </div>

              <div className="space-y-4">
                <button
                  onClick={createGameRoom}
                  className="w-full p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
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
                    placeholder="Oda kodu girin..."
                    className="flex-1 p-4 bg-gray-700 rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
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
                    className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
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
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600 shadow-2xl">
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
                        <p className="text-sm text-gray-300 mt-1">Katili oylama ile elirlerse</p>
                      </div>
                      <div className="bg-red-800/30 p-3 rounded-lg">
                        <strong className="text-red-300">Katil Kazanır:</strong>
                        <p className="text-sm text-gray-300 mt-1">Dedektifi öldürürse veya sadece 2 kişi kalırsa</p>
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
                      <p><strong className="text-red-300">Katil:</strong> Dedektifi öncelikle hedefle</p>
                      <p><strong className="text-green-300">Şüpheli:</strong> Dedektife güven, mantıklı oy ver</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowRules(false)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🎮 Oyuna Başla!
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Oyun yükleniyor...</p>
        </div>
      </div>
    )
  }

  const alivePlayers = players.filter(p => p.isAlive)
  const deadPlayers = players.filter(p => !p.isAlive)
  const clues = gameData.clues ? Object.values(gameData.clues) : []
  const currentTurnDeadPlayers = deadPlayers.filter(p => p.turnDied === gameData.turn)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">🔪 TERS DEDEKTİF: KATİLİ BUL</h1>
            <div className="flex justify-center items-center gap-4 text-sm">
              <span>Oda: <code className="bg-gray-700 px-2 py-1 rounded">{gameRoomId}</code></span>
              <span>Oyuncular: {players.length}</span>
              {myRole && <span>Rolünüz: {ROLES[myRole]?.name}</span>}
            </div>
          </header>

          {/* Lobby */}
          {gamePhase === GAME_PHASES.LOBBY && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">🏠 Oyun Lobisi</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">Oyuncular ({players.length}):</h3>
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div key={player.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                        <span className="font-bold">{player.name}</span>
                        {player.isHost && <span className="text-yellow-400 text-sm">👑 Host</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {isHost && (
                  <button
                    onClick={startGame}
                    disabled={players.length < 4}
                    className="w-full p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
                  >
                    {players.length < 4 ? `Oyunu Başlat (${players.length}/4)` : '🎮 Oyunu Başlat'}
                  </button>
                )}

                {!isHost && (
                  <div className="text-center text-gray-400">
                    Host oyunu başlatmasını bekliyorsunuz...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rol Açıklama */}
          {gamePhase === GAME_PHASES.ROLE_REVEAL && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">🎭 ROL AÇIKLAMA</h2>
                
                {myRole && (
                  <div className="bg-purple-900 p-6 rounded-lg mb-6">
                    <h3 className="text-2xl font-bold mb-2">{ROLES[myRole].name}</h3>
                    <p className="text-gray-300 mb-4">{ROLES[myRole].description}</p>
                    
                    {/* Casus için özel bilgi */}
                    {myRole === 'SPY' && (
                      <div className="bg-red-900 p-4 rounded-lg">
                        <p className="font-bold text-red-300">🕵️ Gizli Bilgi:</p>
                        <p>Katil: <span className="font-bold">
                          {players.find(p => p.role === 'KILLER')?.name}
                        </span></p>
                      </div>
                    )}
                  </div>
                )}

                {isHost && (
                  <button
                    onClick={nextPlayerRole}
                    className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors"
                  >
                    Oyuna Başla
                  </button>
                )}

                {!isHost && (
                  <div className="text-gray-400">
                    Host oyunu başlatmasını bekliyorsunuz...
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
                    <div className="bg-red-900 p-4 rounded-lg mb-4">
                      <p className="font-bold text-red-300">🔪 Katil Seçimi:</p>
                      <p className="text-sm text-gray-400">
                        {gameData.killerCount > 1 
                          ? `${gameData.killerCount} katil birlikte kurban seçiyor...`
                          : 'Kurbanınızı seçin'
                        }
                      </p>
                    </div>

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
                          <span className="font-bold">{player.name}</span>
                          {player.id === playerId && <span className="ml-2 text-green-400">(Siz)</span>}
                        </div>
                      ))}
                    </div>
                    
                    {deadPlayers.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-lg font-bold mb-2">💀 Ölenler ({deadPlayers.length})</h3>
                        <div className="space-y-1">
                          {deadPlayers.map(player => (
                            <div key={player.id} className="bg-red-800 p-2 rounded text-sm">
                              <span>{player.name} - Tur {player.turnDied}</span>
                              {player.eliminatedByVote && <span className="ml-2 text-yellow-300">(Oylama)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">🔍 İpuçları ({clues.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {clues.map((clue, index) => (
                        <div key={index} className="bg-blue-900 p-3 rounded text-sm">
                          <p><strong>Tur {clue.turn}:</strong> {clue.clue}</p>
                        </div>
                      ))}
                    </div>
                    
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
                    <h3 className="text-xl font-bold mb-3">🔍 Mevcut İpuçları</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {clues.map((clue, index) => (
                        <div key={index} className="bg-blue-900/50 p-3 rounded text-sm">
                          <p><strong>Tur {clue.turn}:</strong> {clue.clue}</p>
                          {clue.detective && (
                            <p className="text-blue-300 text-xs mt-1">
                              - Dedektif {clue.detective}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
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
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">🗳️ OYLAMA</h2>
                <p className="mb-4 text-gray-300">Kimi elemeye oyluyorsunuz?</p>
                
                <div className="space-y-2 mb-6">
                  {alivePlayers.map(player => (
                    <button
                      key={player.id}
                      onClick={() => votePlayer(player.id)}
                      className={`w-full p-3 rounded transition-colors text-left ${
                        gameData.votes?.[playerId] === player.id
                          ? 'bg-red-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <span className="font-bold">{player.name}</span>
                      {player.id === playerId && <span className="ml-2 text-green-400">(Siz)</span>}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-400">
                    Oy durumu: {Object.keys(gameData.votes || {}).length} / {alivePlayers.length}
                  </p>
                </div>

                {isHost && (
                  <button
                    onClick={processVotes}
                    className="w-full p-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={Object.keys(gameData.votes || {}).length < alivePlayers.length}
                  >
                    🗳️ Oyları Say ve Eleme Yap
                  </button>
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
                    Sadece 3 oyuncu kaldı! Dedektif son tahmin hakkını kullanabilir.
                    Doğru tahmin ederse İyi Takım kazanır, yanlış tahmin ederse Katiller kazanır.
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

                {/* Tüm ipuçları göster */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">🔍 Tüm İpuçları:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {clues.map((clue, index) => (
                      <div key={index} className="bg-blue-900/50 p-3 rounded text-sm">
                        <p><strong>Tur {clue.turn}:</strong> {clue.clue}</p>
                      </div>
                    ))}
                  </div>
                </div>

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
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <h2 className="text-3xl font-bold mb-4">🎉 OYUN BİTTİ!</h2>
                <p className="text-2xl mb-2 text-yellow-400">Kazanan: {gameData.winner}</p>
                <p className="text-lg mb-6 text-gray-300">Sebep: {gameData.winReason}</p>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Son Durum:</h3>
                  <div className="space-y-2">
                    {players.map(player => (
                      <div key={player.id} className={`p-3 rounded ${
                        player.isAlive ? 'bg-green-700' : 'bg-red-700'
                      }`}>
                        <span className="font-bold">{player.name}</span>
                        <span className="ml-2">- {ROLES[player.role]?.name}</span>
                        <span className="ml-2">
                          {player.isAlive ? '(Yaşıyor)' : '(Öldü)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors"
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
