import { useAtom, useAtomValue } from "jotai"
import { useEffect, useState } from "react";
import { db } from "@/api/pocketbase";
import { 
  title, 
  ingredients, 
  image, 
  description, 
  recipeSteps, 
  seasoning, 
  category,
  keywords, 
  nutrition} from "@/stores/stores";

import OpenAI from "openai";
interface RecipeData {
  title: string;
  ingredients: string;
  seasoning: string;
  steps: string;
  views: number;
  category: string;
  keywords: string;
  desc: string;
  image: File | null;
  nutrition: string | null;
  rating: string[];
}

interface UseUploadRecipeResult {
  uploadRecipe: () => void;
  // getNutritionData: () => void;
  isLoading: boolean;
  error: string | null;
}

const promptContent = `You are a Nutritional Information Assistant, specialized in calculating and summarizing the nutritional content of various ingredients. A chef is looking to understand the total nutritional content of a particular dish made with specific ingredients in certain amounts. Here is how you will provide the nutritional information. Review the provided list of ingredients and their respective amounts. For instance, if given [{"name":"감자","amount":"3개"},{"name":"간장", "amount":"2스푼"},{"name":"물", "amount":"2컵"},{"name":"가지", "amount":"100g"}, {"name":"굴소스", "amount":"10ml"}], understand each ingredient's contribution. For each ingredient, calculate its nutritional content based on the specified amount. Consider standard nutritional values for calories, carbs, protein, and fat. Add up the nutritional values from all the ingredients to get the total nutritional content of the dish. Present the total nutritional content strictly in the JSON format as follows: {"calories":"total calories of all the ingredients", "carbs":"total carbohydrates of all the ingredients", "protein":"total protein of all the ingredients", "fat":"total fat of all the ingredients"}. Now, go ahead and proceed with your tasks to help me understand the nutritional content of my dish. All of the ingredient data given will be in the Korean Language but the key value for the JSON formats should be in English. Take a deep breath and let's work this out in a step by step way to be sure we have the right answer. Make sure to exclude any whitespaces and line breaks`
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function useUploadRecipe(): UseUploadRecipeResult {
  const [titleField,] = useAtom(title);
  const ingredientData = useAtomValue(ingredients);
  const seasoningData = useAtomValue(seasoning);
  const imageFile = useAtomValue(image);
  const categoryData = useAtomValue(category)
  const keywordsData = useAtomValue(keywords);
  const [nutritionData, setNutritionData] = useAtom(nutrition);
  const descriptionText = useAtomValue(description);
  const steps = useAtomValue(recipeSteps);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function getNutritionData() {
      const completion = await openai.chat.completions.create({
        n: 1,
        messages: [
          {
            role: 'system',
            content:
              `${promptContent}`,
          },
          {
            role: 'user',
            content:
              `${ingredientData}, ${seasoningData} give me the nutritional information for these ingredients in a JSON format without any whitespaces. Make sure to add the unit for each data.`,
          },
        ],
        model: 'gpt-3.5-turbo-0125',
        response_format: { type: 'json_object' },
      });
      console.log(completion.choices[0].message.content);
      const result = completion.choices[0].message.content;
      setNutritionData(result);
    }
    getNutritionData();
  }, []);

  async function uploadRecipe() {
    
    try {
      setIsLoading(true);
      const data: RecipeData = {
        title: titleField,
        ingredients: ingredientData,
        seasoning: seasoningData,
        steps: steps,
        views: 0,
        category: categoryData,
        keywords: keywordsData,
        desc: descriptionText,
        image: imageFile,
        nutrition: nutritionData,
        rating: []
      };
      const record = await db.collection('recipes').create(data);

      setIsLoading(false);
      setError(null);

      return record; 
    } catch (error) {
      setIsLoading(false);
      
      throw error; 
    }
  }

  return { uploadRecipe, isLoading, error };
}