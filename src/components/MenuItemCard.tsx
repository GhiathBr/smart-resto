import Image from 'next/image';

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
}

export default function MenuItemCard({
  name,
  description,
  price,
  imageUrl,
}: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
