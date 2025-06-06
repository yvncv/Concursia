import { useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { ForumType, ReplyType } from "@/app/types/ForumTypes";
import useUser from "@/app/hooks/useUser";

export const useForums = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<ForumType[]>([]);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "forums"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        // Si createdAt es null (porque el serverTimestamp todavía no se resolvió),
        // simplemente usa la hora actual o un valor por defecto.
        const createdAtDate = d.createdAt
          ? (d.createdAt as Timestamp).toDate()
          : new Date();

        return {
          id: docSnap.id,
          title: d.title,
          description: d.description,
          category: d.category,
          createdByUid: d.createdByUid,
          createdByName: d.createdByName,
          createdAt: createdAtDate,
          repliesCount: d.repliesCount || 0,
          views: d.views || 0,
        };
      });

      setPosts(data);
    } catch (e) {
      console.error("Error al obtener foros:", e);
    }
  };

  const createPost = async (
    title: string,
    description: string,
    category: string
  ) => {
    if (!user || !title.trim() || !description.trim()) return;
    try {
      await addDoc(collection(db, "forums"), {
        title: title.trim(),
        description: description.trim(),
        category,
        createdByUid: user.uid,
        createdByName: user.firstName + " " + user.lastName || user.uid,
        createdAt: serverTimestamp(),
        repliesCount: 0,
        views: 0,
      });
      await fetchPosts();
    } catch (error) {
      console.error("Error al crear foro:", error);
    }
  };

  const editPost = async (
    postId: string,
    title: string,
    description: string,
    category: string
  ) => {
    if (!user || !title.trim() || !description.trim()) return;
    try {
      const postRef = doc(db, "forums", postId);
      await updateDoc(postRef, {
        title: title.trim(),
        description: description.trim(),
        category,
      });
      await fetchPosts();
    } catch (error) {
      console.error("Error al editar foro:", error);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    try {
      const postRef = doc(db, "forums", postId);
      await deleteDoc(postRef);
      await fetchPosts();
    } catch (error) {
      console.error("Error al eliminar foro:", error);
    }
  };

  const addReply = async (forumId: string, text: string) => {
    if (!user || !text.trim()) return;
    try {
      await addDoc(collection(db, `forums/${forumId}/replies`), {
        text: text.trim(),
        createdByUid: user.uid,
        createdByName: user.firstName + " " + user.lastName || user.uid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "forums", forumId), {
        repliesCount: increment(1),
      });
      await fetchPosts();
    } catch (error) {
      console.error("Error al agregar reply:", error);
    }
  };

  const fetchReplies = async (forumId: string): Promise<ReplyType[]> => {
    try {
      const q = query(
        collection(db, `forums/${forumId}/replies`),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const replyDate = d.createdAt
          ? (d.createdAt as Timestamp).toDate()
          : new Date();

        return {
          id: docSnap.id,
          forumId,
          text: d.text,
          createdByUid: d.createdByUid,
          createdByName: d.createdByName,
          createdAt: replyDate,
        };
      });
    } catch (error) {
      console.error("Error al obtener replies:", error);
      return [];
    }
  };

  const editReply = async (
    forumId: string,
    replyId: string,
    newText: string
  ) => {
    if (!user || !newText.trim()) return;
    try {
      const replyRef = doc(db, `forums/${forumId}/replies`, replyId);
      await updateDoc(replyRef, { text: newText.trim() });
      // No es necesario volver a fetchPosts(),
      // pero tal vez quieras recargar los replies si tienes abierto ese modal.
    } catch (error) {
      console.error("Error al editar reply:", error);
    }
  };

  const deleteReply = async (forumId: string, replyId: string) => {
    if (!user) return;
    try {
      const replyRef = doc(db, `forums/${forumId}/replies`, replyId);
      await deleteDoc(replyRef);
      // Decrementar el contador de replies en el post:
      await updateDoc(doc(db, "forums", forumId), {
        repliesCount: increment(-1),
      });
      await fetchPosts();
    } catch (error) {
      console.error("Error al eliminar reply:", error);
    }
  };

  return {
    posts,
    fetchPosts,
    createPost,
    editPost,
    deletePost,
    addReply,
    fetchReplies,
    editReply,
    deleteReply,
  };
};
