// import { Upload, File, CheckCircle, X, Loader2 } from "lucide-react";
// import { useCallback, useState } from "react";
// import { useDropzone } from "react-dropzone";
// import { FormField } from "../ui/form";

// interface UploadedFile {
//   name: string;
//   url: string;
//   file: File;
// }

// interface TUploadImage {
//   maxFiles?: number; // Prop opcional para máximo de arquivos, default 2
// }

// export const UploadImage = ({ maxFiles = 2 }: TUploadImage) => {
//   const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]); // Array de arquivos carregados
//   const [isUploading, setIsUploading] = useState<boolean>(false); // Estado para loading

//   const onDrop = useCallback(
//     (acceptedFiles: File[]) => {
//       setIsUploading(true);
//       const newFiles = acceptedFiles.slice(0, maxFiles - uploadedFiles.length); // Adiciona apenas até o limite
//       const promises = newFiles.map((file: File) => {
//         return new Promise<UploadedFile>((resolve) => {
//           const reader = new FileReader();
//           reader.onload = () => {
//             resolve({ name: file.name, url: reader.result as string, file }); // Armazena nome, URL e arquivo original
//           };
//           reader.readAsDataURL(file);
//         });
//       });

//       Promise.all(promises)
//         .then((results: UploadedFile[]) => {
//           setUploadedFiles((prev: UploadedFile[]) => [...prev, ...results]);
//           setIsUploading(false);
//           // Aqui você pode fazer o upload real para um servidor com results
//           console.log("Arquivos carregados:", results);
//         })
//         .catch(() => {
//           setIsUploading(false);
//           console.error("Erro ao processar arquivos");
//         });
//     },
//     [uploadedFiles.length, maxFiles]
//   );

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: { "image/*": [] }, // Aceita apenas imagens
//     maxFiles: maxFiles, // Usa a prop para múltiplos arquivos
//     multiple: true, // Permite múltiplos
//   });

//   const removeFile = (indexToRemove: number) => {
//     setUploadedFiles((prev: UploadedFile[]) =>
//       prev.filter((_, index: number) => index !== indexToRemove)
//     );
//   };

//   const currentCount = uploadedFiles.length;
//   const isFull = currentCount >= maxFiles;

//   return (
//     <>
//       {currentCount > 0 ? (
//         <div className="flex flex-col space-y-2">
//           <div className="grid grid-cols-2 gap-4">
//             {" "}
//             {uploadedFiles.map((uploadedFile: UploadedFile, index: number) => (
//               <div
//                 key={index}
//                 className="relative flex flex-col items-center p-2  border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
//               >
//                 <File className="w-8 h-8 text-gray-400 mb-2" />
//                 <p className="text-white text-sm text-center truncate max-w-[120px]">
//                   {uploadedFile.name}
//                 </p>
//                 <button
//                   onClick={() => removeFile(index)}
//                   className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-400 transition-colors rounded-full bg-gray-900/50"
//                   type="button"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="flex items-center space-x-2 text-green-400">
//             <CheckCircle />
//             <p className="font-medium shrink-0">
//               {currentCount} de {maxFiles} arquivo(s) carregado(s) com sucesso!
//             </p>
//           </div>
//           {!isFull && (
//             <div
//               {...getRootProps()}
//               className="dropzone relative flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer
//                      bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:from-gray-700 hover:to-gray-800
//                      transition-all duration-300 shadow-lg hover:shadow-xl"
//             >
//               <input
//                 {...getInputProps()}
//                 className="absolute inset-0 opacity-0 cursor-pointer"
//               />
//               <Upload className="w-8 h-8 text-gray-400 mb-2" />
//               <p className="text-white text-sm">
//                 Adicionar mais (até {maxFiles})
//               </p>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div
//           {...getRootProps()}
//           className="dropzone relative flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer
//                  bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:from-gray-700 hover:to-gray-800
//                  transition-all duration-300 shadow-lg hover:shadow-xl min-h-[100px]"
//         >
//           <input
//             {...getInputProps()}
//             className="absolute inset-0 opacity-0 cursor-pointer"
//           />

//           <div className="flex flex-col items-center space-y-4">
//             {isUploading ? (
//               <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
//             ) : (
//               <Upload className="w-12 h-12 text-gray-400 hover:text-blue-400 transition-colors duration-300" />
//             )}

//             {isDragActive ? (
//               <div className="space-y-1">
//                 <p className="text-white font-medium">
//                   Solte as imagens aqui...
//                 </p>
//                 <p className="text-gray-400 text-sm">Até {maxFiles} arquivos</p>
//               </div>
//             ) : (
//               <div className="space-y-1">
//                 <p className="text-white font-medium">
//                   Arraste imagens aqui ou clique para selecionar
//                 </p>
//                 <p className="text-gray-400 text-sm">
//                   Suporte para JPG, PNG e GIF (máx. 5MB cada)
//                 </p>
//               </div>
//             )}
//           </div>

//           {isUploading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
//               <p className="text-white">Processando...</p>
//             </div>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// export default UploadImage;
