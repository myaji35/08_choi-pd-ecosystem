'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, X, Edit2, Settings } from 'lucide-react';

// Types
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  updatedAt: string;
}

interface Column {
  id: TaskStatus;
  title: string;
  bgColor: string;
}

const columns: Column[] = [
  { id: 'TODO', title: '할 일', bgColor: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: '진행 중', bgColor: 'bg-blue-50' },
  { id: 'DONE', title: '완료', bgColor: 'bg-green-50' },
];

// Default project ID - you can make this dynamic later
const PROJECT_ID = '1';

function KanbanBoard() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addingColumn, setAddingColumn] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [apiKeyMessage, setApiKeyMessage] = useState('');

  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>({
    queryKey: ['tasks', PROJECT_ID],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${PROJECT_ID}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', PROJECT_ID] });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: { title: string; description: string; status: TaskStatus }) => {
      const response = await fetch(`/api/projects/${PROJECT_ID}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', PROJECT_ID] });
      setAddingColumn(null);
      setNewTaskTitle('');
      setNewTaskDescription('');
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', PROJECT_ID] });
    },
  });

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    updateTaskMutation.mutate({
      taskId,
      updates: { status: newStatus },
    });
  };

  // Get tasks by status
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  // Handle add task
  const handleAddTask = (status: TaskStatus) => {
    if (!newTaskTitle.trim()) return;

    createTaskMutation.mutate({
      title: newTaskTitle,
      description: newTaskDescription,
      status,
    });
  };

  // Handle edit task
  const handleEditTask = () => {
    if (!editingTask) return;

    updateTaskMutation.mutate({
      taskId: editingTask.id,
      updates: {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
      },
    });
    setEditingTask(null);
  };

  // Handle API key change
  const handleApiKeyChange = async () => {
    if (!newApiKey.trim()) {
      setApiKeyMessage('API 키를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newApiKey }),
      });

      if (response.ok) {
        setApiKeyMessage('API 키가 성공적으로 저장되었습니다. 페이지를 새로고침합니다...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setApiKeyMessage('API 키 저장에 실패했습니다.');
      }
    } catch (error) {
      setApiKeyMessage('오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold">칸반 보드</h1>
          {isError ? (
            <>
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                API 연결 실패
              </span>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                키 변경
              </button>
            </>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              API 연결됨
            </span>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className={`${column.bgColor} rounded-lg p-4`}>
                  <h2 className="font-semibold text-lg mb-4 flex items-center justify-between">
                    {column.title}
                    <span className="text-sm text-gray-600 font-normal">
                      {getTasksByStatus(column.id).length}
                    </span>
                  </h2>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] space-y-2 ${
                          snapshot.isDraggingOver ? 'bg-blue-100 rounded-lg' : ''
                        }`}
                      >
                        {getTasksByStatus(column.id).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-600' : ''
                                }`}
                                onClick={() => setEditingTask(task)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium text-sm flex-1 pr-2">{task.title}</h3>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTaskMutation.mutate(task.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {task.description}
                                  </p>
                                )}
                                <div className="text-xs text-gray-400">
                                  {format(new Date(task.updatedAt), 'PPP', { locale: ko })}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Add card button */}
                  {addingColumn === column.id ? (
                    <div className="mt-2 bg-white rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        placeholder="제목"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTask(column.id);
                          } else if (e.key === 'Escape') {
                            setAddingColumn(null);
                            setNewTaskTitle('');
                            setNewTaskDescription('');
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        autoFocus
                      />
                      <textarea
                        placeholder="설명 (선택)"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddTask(column.id);
                          } else if (e.key === 'Escape') {
                            setAddingColumn(null);
                            setNewTaskTitle('');
                            setNewTaskDescription('');
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddTask(column.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          추가
                        </button>
                        <button
                          onClick={() => {
                            setAddingColumn(null);
                            setNewTaskTitle('');
                            setNewTaskDescription('');
                          }}
                          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingColumn(column.id)}
                      className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      카드 추가
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                태스크 편집
              </h2>
              <button
                onClick={() => setEditingTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditTask();
                    } else if (e.key === 'Escape') {
                      setEditingTask(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  value={editingTask.status}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="TODO">할 일</option>
                  <option value="IN_PROGRESS">진행 중</option>
                  <option value="DONE">완료</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleEditTask}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                API 키 변경
              </h2>
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setNewApiKey('');
                  setApiKeyMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 API 키
                </label>
                <input
                  type="text"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApiKeyChange();
                    } else if (e.key === 'Escape') {
                      setShowApiKeyModal(false);
                      setNewApiKey('');
                      setApiKeyMessage('');
                    }
                  }}
                  placeholder="sk_live_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                  autoFocus
                />
              </div>

              {apiKeyMessage && (
                <p
                  className={`text-sm ${
                    apiKeyMessage.includes('성공')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {apiKeyMessage}
                </p>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleApiKeyChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setNewApiKey('');
                    setApiKeyMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function KanbanPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <KanbanBoard />
    </QueryClientProvider>
  );
}
