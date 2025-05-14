// const url = `${import.meta.env.VITE_APP_BASE_URL}${import.meta.env.VITE_APP_BASE_API}`;

// export const spiderService = {
//   async doSpider(productData: CreateProductDto): Promise<Product> {
//     const response = await fetch(`${url}/spider`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(productData),
//     });
//     if (!response.ok) {
//       // 尝试解析错误信息
//       const errorData = await response.json().catch(() => ({ message: 'Failed to do spider' }));
//       throw new Error(errorData.message || 'Failed to do spider');
//     }
//     return response.json();
//   },
// };
