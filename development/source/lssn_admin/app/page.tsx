"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createCategory,
  createTopic,
  deleteCategory,
  deleteLssn,
  deleteTopic,
  deleteUser,
  getCategories,
  getLssnsAll,
  getTopics,
  getUsers,
  login,
  logout,
  updateCategory,
  updateLssn,
  updateTopic,
  updateUserRole,
  uploadImage,
} from "@/lib/api";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLoginCard } from "@/components/admin/admin-login-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminStats } from "@/components/admin/admin-stats";
import { StatusBanner } from "@/components/admin/status-banner";
import {
  CategoriesSection,
  LssnsSection,
  TopicsSection,
  UsersSection,
} from "@/components/admin/sections";
import type { AdminTabKey } from "@/components/admin/types";

export default function Home() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTabKey>("home");

  const [users, setUsers] = useState<any[]>([]);
  const [lssns, setLssns] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryThumb, setCategoryThumb] = useState<string | null>(null);
  const [topicName, setTopicName] = useState("");
  const [topicSlug, setTopicSlug] = useState("");

  const hasData = useMemo(
    () => users.length || lssns.length || categories.length || topics.length,
    [users, lssns, categories, topics]
  );

  const loadAll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersRows, lssnRows, categoryRows, topicRows] = await Promise.all([
        getUsers(),
        getLssnsAll(),
        getCategories(),
        getTopics(),
      ]);
      setUsers(usersRows);
      setLssns(lssnRows);
      setCategories(categoryRows);
      setTopics(topicRows);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load admin data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAll();
    }
  }, [user]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(email, password);
      if (result.role !== "admin") {
        throw new Error("Admin access required");
      }
      setUser({ email: result.email, role: result.role });
      setPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setUsers([]);
    setLssns([]);
    setCategories([]);
    setTopics([]);
  };

  const handleCategoryUpload = async (file: File) => {
    const result = await uploadImage(file);
    setCategoryThumb(result.url);
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;
    const created = await createCategory({
      name: categoryName,
      slug: categorySlug || undefined,
      thumbnailUrl: categoryThumb ?? undefined,
    });
    setCategories((prev) => [created, ...prev]);
    setCategoryName("");
    setCategorySlug("");
    setCategoryThumb(null);
  };

  const handleCreateTopic = async () => {
    if (!topicName.trim()) return;
    const created = await createTopic({
      name: topicName,
      slug: topicSlug || undefined,
    });
    setTopics((prev) => [created, ...prev]);
    setTopicName("");
    setTopicSlug("");
  };

  if (!user) {
    return (
      <AdminLoginCard
        email={email}
        password={password}
        error={error}
        isLoading={isLoading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <AdminShell
      sidebar={
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      }
      header={
        <AdminHeader
          userEmail={user.email}
          activeTab={activeTab}
          onRefresh={loadAll}
          onLogout={handleLogout}
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-6">
        <AdminStats
          usersCount={users.length}
          lssnsCount={lssns.length}
          categoriesCount={categories.length}
          topicsCount={topics.length}
          users={users}
          lssns={lssns}
          categories={categories}
          topics={topics}
          showCharts={activeTab === "home"}
        />

        <StatusBanner error={error} isLoading={isLoading} hasData={!!hasData} />
        {activeTab === "users" && (
          <UsersSection
            users={users}
            onRoleChange={async (id, role) => {
              const updated = await updateUserRole(id as any, role as any);
              setUsers((prev) =>
                prev.map((item) => (item.id === id ? updated : item))
              );
            }}
            onDelete={async (id) => {
              await deleteUser(id as any);
              setUsers((prev) => prev.filter((item) => item.id !== id));
            }}
          />
        )}

        {activeTab === "lssns" && (
          <LssnsSection
            lssns={lssns}
            onToggleStatus={async (id, status) => {
              const updated = await updateLssn(id as any, { status });
              setLssns((prev) =>
                prev.map((item) => (item.id === id ? updated : item))
              );
            }}
            onDelete={async (id) => {
              await deleteLssn(id as any);
              setLssns((prev) => prev.filter((item) => item.id !== id));
            }}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesSection
            categories={categories}
            categoryName={categoryName}
            categorySlug={categorySlug}
            categoryThumb={categoryThumb}
            onCategoryNameChange={setCategoryName}
            onCategorySlugChange={setCategorySlug}
            onUpload={handleCategoryUpload}
            onCreate={handleCreateCategory}
            onRefresh={async (id, name) => {
              const updated = await updateCategory(id as any, { name });
              setCategories((prev) =>
                prev.map((item) => (item.id === id ? updated : item))
              );
            }}
            onDelete={async (id) => {
              await deleteCategory(id as any);
              setCategories((prev) => prev.filter((item) => item.id !== id));
            }}
          />
        )}

        {activeTab === "topics" && (
          <TopicsSection
            topics={topics}
            topicName={topicName}
            topicSlug={topicSlug}
            onTopicNameChange={setTopicName}
            onTopicSlugChange={setTopicSlug}
            onCreate={handleCreateTopic}
            onRefresh={async (id, name) => {
              const updated = await updateTopic(id as any, { name });
              setTopics((prev) =>
                prev.map((item) => (item.id === id ? updated : item))
              );
            }}
            onDelete={async (id) => {
              await deleteTopic(id as any);
              setTopics((prev) => prev.filter((item) => item.id !== id));
            }}
          />
        )}
      </div>
    </AdminShell>
  );
}
