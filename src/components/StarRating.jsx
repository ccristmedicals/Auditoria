import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ rating, onRate, disabled = false }) => {
  // Estado para saber sobre qué estrella está el mouse (hover)
  const [hover, setHover] = useState(0);

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        // Lógica: ¿Debo pintar esta estrella?
        // Si hay hover, pintamos hasta donde esté el mouse.
        // Si no hay hover, pintamos el rating guardado.
        const isActive = star <= (hover || rating);

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={`transition-all duration-200 focus:outline-none transform ${
              isActive
                ? "text-yellow-400 scale-110" // Activa: Amarilla y un pelín más grande
                : "text-gray-300 dark:text-gray-600 hover:scale-110" // Inactiva: Gris
            } ${disabled ? "cursor-default" : "cursor-pointer"}`}
            // Eventos del Mouse
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onRate(star)}
          >
            <Star
              size={18}
              // fill="currentColor" rellena la estrella por dentro
              // Si no quieres relleno (solo borde), quita el fill o haz lógica condicional
              fill={isActive ? "currentColor" : "none"}
              strokeWidth={isActive ? 0 : 2} // Sin borde si está rellena, borde si está vacía
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
