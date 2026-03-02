package workflow

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// OrderWorkflow is a sample workflow definition
func OrderWorkflow(ctx workflow.Context, orderID string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	logger := workflow.GetLogger(ctx)
	logger.Info("Order workflow started", "orderID", orderID)

	// In a real implementation, we would execute activities here
	// var result string
	// err := workflow.ExecuteActivity(ctx, activities.CreateOrder, orderID).Get(ctx, &result)

	return "Order processed", nil
}
