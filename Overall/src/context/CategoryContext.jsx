import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const CategoryContext = createContext();

export const useCategories = () => useContext(CategoryContext);

const defaultCategories = {
    'Cloths': ['Men', 'Women', 'Children'],
    'Furniture': ['Table', 'Chairs', 'Sofas', 'Beds'],
    'Bags': ['Backpack', 'Messenger', 'Tote', 'Travel'],
    'Shoes': ['Men', 'Women', 'Kids'],
    'Jewelries': ['Necklaces', 'Earrings', 'Rings', 'Bracelets'],
    'Accessories': ['Watches', 'Belts', 'Hats', 'Sunglasses']
};

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState(defaultCategories);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const products = productsSnapshot.docs.map(doc => doc.data());

            const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

            let dynamicCategories = { ...defaultCategories };

            uniqueCategories.forEach(category => {
                if (!dynamicCategories[category]) {
                    const subcategories = [...new Set(
                        products.filter(p => p.category === category).map(p => p.subcategory).filter(Boolean)
                    )];
                    dynamicCategories[category] = subcategories.length > 0 ? subcategories : ['All'];
                }
            });

            setCategories(dynamicCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CategoryContext.Provider value={{ categories, loading }}>
            {children}
        </CategoryContext.Provider>
    );
};