import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  // Trophy,
  // Target,
  // Zap,
  // Calendar,
  // Medal,
  // TrendingUp,
  X,
  Upload,
  Camera,
} from "lucide-react";
import { api } from '../../services/api';


interface UserStats {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  rank: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  createdAt: string;
}

// Fonction utilitaire pour corriger l'URL d'image
function getCleanImageUrl(url?: string) {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://netwebback.onrender.com${url}`;
}

export const Profile: React.FC = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  // const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Étape 1 : récupérer la chaîne JSON stockée dans le champ 'user'
        const userString = localStorage.getItem("user");
        let Id = ''

        // Étape 2 : s'assurer que la chaîne existe avant de parser
        if (userString) {
          const userObject = JSON.parse(userString); // convertir en objet JavaScript

     
           Id = userObject._id

        } else {
          console.log("Aucune donnée 'user' trouvée dans le localStorage.");
        }

        const response = await api.get(`/api/profil/public/${Id}`);
        setUserStats(response.data);

        // Simuler des matchs récents (à remplacer par votre véritable appel API)
        // const mockMatches: Match[] = [
        //   {
        //     id: "1",
        //     opponent: "Sophie_TCP",
        //     result: "victory",
        //     score: `${response.data.totalScore > 50 ? 12 : 8}-${
        //       response.data.totalScore > 50 ? 8 : 12
        //     }`,
        //     date: new Date().toISOString(),
        //     theme: "OSI",
        //   },
        //   // Ajoutez d'autres matchs simulés ou réels ici
        // ];
        // setRecentMatches(mockMatches);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données du profil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const experiencePercent = userStats
    ? (userStats.experience / userStats.nextLevelExp) * 100
    : 0;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userStats) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const response = await api.post(
        "/api/profil/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Mettre à jour l'état local avec la nouvelle image
      setUserStats({
        ...userStats,
        profilePicture: response.data.imageUrl,
      });

      // Mettre à jour le localStorage pour synchroniser la photo de profil dans le header
      const userString = localStorage.getItem("user");
      if (userString) {
        const userObject = JSON.parse(userString);
        userObject.profilePicture = response.data.imageUrl;
        localStorage.setItem("user", JSON.stringify(userObject));
        window.location.reload();
      }

      setUploadMessage({
        text: "Photo de profil mise à jour avec succès!",
        isError: false,
      });
      setTimeout(() => {
        setPreviewImage(null);
        setSelectedFile(null);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      setUploadMessage({
        text: "Erreur lors de la mise à jour de la photo",
        isError: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement en cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* Overlay de prévisualisation */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Prévisualisation</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <img
                src={previewImage}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />

              {uploadMessage && (
                <div
                  className={`mb-4 p-2 rounded-md w-full text-center ${
                    uploadMessage.isError
                      ? "bg-red-900 text-red-100"
                      : "bg-green-900 text-green-100"
                  }`}
                >
                  {uploadMessage.text}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 sm:p-8 border border-gray-700"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={getCleanImageUrl(userStats.profilePicture)}
                alt={`${userStats.username}'s profile`}
                className="w-24 h-24 rounded-full border-4 border-blue-500 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleImageClick}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 text-xs"
                  onClick={handleImageClick}
                >
                  Changer
                </button>
              </div>

              <button
                onClick={handleImageClick}
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-500 rounded-full p-2 cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {userStats.username}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
                  Niveau {userStats.level}
                </span>
                <span className="text-gray-300">
                  {userStats.experience} / {userStats.nextLevelExp} XP
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${experiencePercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">
                {userStats.nextLevelExp - userStats.experience} XP pour le
                niveau suivant
              </p>
            </div>
          </div>
        </motion.div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Statistiques
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {userStats.gamesPlayed}
                  </div>
                  <div className="text-sm text-gray-400">Parties jouées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {userStats.winRate}%
                  </div>
                  <div className="text-sm text-gray-400">Taux de victoire</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {userStats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-400">Série actuelle</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {userStats.totalScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Score total</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-purple-400" />
                Derniers matchs
              </h2>
              <div className="space-y-3">
                {recentMatches.length > 0 ? (
                  recentMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          match.result === "victory"
                            ? "bg-green-400"
                            : match.result === "defeat"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <span className="font-medium">
                            vs {match.opponent}
                          </span>
                          <span className="text-sm bg-gray-600 px-2 py-1 rounded">
                            {match.theme}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {match.score} •{" "}
                          {new Date(match.date).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded text-sm font-medium text-center ${
                          match.result === "victory"
                            ? "bg-green-600 text-white"
                            : match.result === "defeat"
                            ? "bg-red-600 text-white"
                            : "bg-yellow-600 text-white"
                        }`}
                      >
                        {match.result === "victory"
                          ? "Victoire"
                          : match.result === "defeat"
                          ? "Défaite"
                          : "Egalité"}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    Aucun match récent
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Classements
              </h2>
              <div className="space-y-4">
                {[
                  {
                    period: "daily",
                    icon: <Calendar />,
                    color: "text-blue-400",
                    label: "Aujourd'hui",
                  },
                  {
                    period: "weekly",
                    icon: <Target />,
                    color: "text-green-400",
                    label: "Cette semaine",
                  },
                  {
                    period: "monthly",
                    icon: <Medal />,
                    color: "text-purple-400",
                    label: "Ce mois",
                  },
                ].map((item) => (
                  <div
                    key={item.period}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {React.cloneElement(item.icon, {
                        className: `w-5 h-5 ${item.color}`,
                      })}
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className={`text-xl font-bold ${item.color}`}>
                        {
                          userStats.rank[
                            item.period as keyof typeof userStats.rank
                          ]
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Medal className="w-6 h-6 text-yellow-400" />
                Succès récents
              </h2>
              <div className="space-y-3">
                {userStats.bestStreak >= 5 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg">
                    <Trophy className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Série de victoires</div>
                      <div className="text-sm opacity-90">
                        {userStats.bestStreak} victoires consécutives
                      </div>
                    </div>
                  </div>
                )}
                {userStats.winRate >= 80 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                    <Target className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Expert en réseau</div>
                      <div className="text-sm opacity-90">
                        Taux de victoire: {userStats.winRate}%
                      </div>
                    </div>
                  </div>
                )}
                {userStats.level >= 10 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                    <Zap className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Maître du jeu</div>
                      <div className="text-sm opacity-90">
                        Niveau {userStats.level} atteint
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div> */}
      </div>
    </div>
  );
};
