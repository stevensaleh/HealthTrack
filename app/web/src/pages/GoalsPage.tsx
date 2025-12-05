import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoals } from '@/hooks/useGoals';
import { useGoalActions } from '@/hooks/useGoalActions';
import GoalCard from '@/components/GoalCard';
import CreateGoalModal from '@/components/CreateGoalModal';
import { Goal } from '@/hooks/useGoals';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type TabType = 'active' | 'completed' | 'all';

export default function GoalsPage() {
  const navigate = useNavigate();
  const { goals, stats, loading, error, refetch } = useGoals();
  const goalActions = useGoalActions();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Filter goals based on active tab
  const filteredGoals = (goals || []).filter((goal) => {
    if (activeTab === 'active')
         return goal.status === 'ACTIVE';
    if (activeTab === 'completed')
         return goal.status === 'COMPLETED';
    return true; 
  });

  const handleCreateGoal = async (data: any) => {
    try {
      await goalActions.createGoal(data);
      await refetch();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleUpdateGoal = async (data: any) => {
    if (!editingGoal) return;
    
    try {
      await goalActions.updateGoal(editingGoal.id, data);
      await refetch();
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalActions.deleteGoal(goalId);
      await refetch();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await goalActions.completeGoal(goalId);
      await refetch();
      
      // Show success message with confetti effect
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        alert(`Congratulations! You completed "${goal.title}"!`);
      }
    } catch (error) {
      console.error('Failed to complete goal:', error);
      alert('Failed to complete goal. Please try again.');
    }
  };

  const handlePauseGoal = async (goalId: string) => {
    try {
      await goalActions.pauseGoal(goalId);
      await refetch();
    } catch (error) {
      console.error('Failed to pause goal:', error);
      alert('Failed to pause goal. Please try again.');
    }
  };

  const handleResumeGoal = async (goalId: string) => {
    try {
      await goalActions.resumeGoal(goalId);
      await refetch();
    } catch (error) {
      console.error('Failed to resume goal:', error);
      alert('Failed to resume goal. Please try again.');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#fafafa',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid var(--color-border-light)',
              borderTop: '4px solid var(--color-accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
            Loading goals...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#fafafa',
        }}
      >
        <div style={{ 
            textAlign: 'center',
             maxWidth: '400px' }}>
          <p style={{ 
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-lg)' }}>
            {error}
          </p>
          <button
            onClick={() => refetch()}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: 'var(--space-8)' }}>
      {/* Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'var(--color-bg-white)',
                border: '2px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-light)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <ArrowBackIcon />
            </button>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-4xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-text-primary)',
                }}
              >
                My Goals
              </h1>
              <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)' }}>
                Track your fitness and health objectives
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E67A35';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-accent)';
            }}
          >
            <AddIcon />
            Add Goal
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {/* Active Goals */}
            <div
              style={{
                background: 'var(--color-bg-white)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '2px solid var(--color-border-light)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: '#3B82F620',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <TrendingUpIcon />
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '4px',
                }}
              >
                {stats.active}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Active Goals
              </div>
            </div>

            {/* Completed Goals */}
            <div
              style={{
                background: 'var(--color-bg-white)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '2px solid var(--color-border-light)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: '#10B98120',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <CheckCircleIcon />
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '4px',
                }}
              >
                {stats.completed}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Completed Goals
              </div>
            </div>

            {/* Success Rate */}
            <div
              style={{
                background: 'var(--color-bg-white)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '2px solid var(--color-border-light)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FF8C4220',
                  color: '#FF8C42',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <EmojiEventsIcon />
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '4px',
                }}
              >
                {stats.completionRate.toFixed(0)}%
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Success Rate
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            background: 'var(--color-bg-white)',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--color-border-light)',
          }}
        >
          <button
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              background: activeTab === 'active' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'active' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Active ({stats?.active || 0})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              background: activeTab === 'completed' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'completed' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Completed ({stats?.completed || 0})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              background: activeTab === 'all' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'all' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            All ({stats?.total || 0})
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {filteredGoals.length === 0 ? (
          <div
            style={{
              background: 'var(--color-bg-white)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--color-border-light)',
              padding: 'var(--space-12)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                marginBottom: 'var(--space-4)',
                opacity: 0.3,
              }}
            >
            </div>
            <h3
              style={{
                margin: '0 0 var(--space-2) 0',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {activeTab === 'active' ? 'No Active Goals' : activeTab === 'completed' ? 'No Completed Goals Yet' : 'No Goals Yet'}
            </h3>
            <p
              style={{
                margin: '0 0 var(--space-6) 0',
                color: 'var(--color-text-muted)',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {activeTab === 'active'
                ? 'Start your fitness journey by creating your first goal!'
                : activeTab === 'completed'
                ? 'Complete your active goals to see them here.'
                : 'Create your first goal to start tracking your progress.'}
            </p>
            {activeTab !== 'completed' && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--color-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <AddIcon />
                Create Your First Goal
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onComplete={handleCompleteGoal}
                onPause={handlePauseGoal}
                onResume={handleResumeGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateGoalModal
        isOpen={showCreateModal || !!editingGoal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingGoal(null);
        }}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        editingGoal={editingGoal}
      />
    </div>
  );
}